/* Trawün, the community page of Mapudungukeaiñ Fill Püle (Cloudflare Worker + D1).
   People join with a nickname only; the page keeps a random key on the phone that proves who wrote what. No names, emails
   or other personal data are stored. Learners may be under 18, so:
   - messages and captions with emails, phone numbers, links, @handles or other apps are refused (the page checks too);
   - uploaded photos stay hidden ("pending") until the moderator approves them; Vestuario and progress posts carry only
     game data (a character, item ids, numbers) and are drawn by the page, so they show at once;
   - three reports from different people hide a message or post until the moderator decides;
   - the moderator (ADMIN_KEY secret) approves, hides, deletes, and blocks nicknames.

   POST /join {nick}                       -> {id, nick, key}            409 if the nickname is taken
   GET  /msgs?ch=mapu|ramtun               -> {msgs:[{id,ch,uid,nick,text,ts}]}   newest 200, oldest first
   POST /msgs {key, ch, text}              -> {id}                       429 when too fast, 403 blocked
   POST /msgs/edit {key, id, text}         -> {ok, edited}               own messages only, for 24 hours; the first
                                                                         text is kept (orig) for the moderator
   GET  /posts[?key=]                      -> {posts:[…]}                approved ones, plus the caller's own pending ones
   POST /posts {key, kind, cat, caption, outfit|progress|image}  -> {id, status}
   GET  /img/ID[?key=]                     -> image/jpeg                 approved photos, or the author's own
   POST /report {key, type: msg|post, id}  -> {ok}
   GET  /admin/queue        (X-Admin)      -> {posts, msgs, reports}
   POST /admin/act {type,id,action}        approve | hide | delete | ban  (X-Admin)
   GET  /admin/img/ID       (X-Admin)      -> image/jpeg
   Binding: a D1 database (DB). Variables: ORIGINS (comma-separated allowed origins). Secrets: ADMIN_KEY; for notifications TG_TOKEN + TG_CHAT (Telegram), or NTFY_TOPIC (+ NTFY_TOKEN). */

const MAX_TEXT = 500, MAX_CAP = 140, MAX_IMG = 700 * 1024;
const CHANNELS = ["mapu", "ramtun"], CATS = ["vestuario", "progreso", "otra"];
const NICK_RE = /^[\p{L}\p{N}_ -]{2,20}$/u;

function privacyProblem(t) {
  const s = String(t || "");
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(s)) return "email";
  if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|cl|net|org|io|me|ly|gg|app|xyz)\b)/i.test(s)) return "link";
  if (/(\+?\d[\d\s().-]{6,}\d)/.test(s) && (s.match(/\d/g) || []).length >= 7) return "phone";
  if (/(^|\s)@[a-z0-9_.]{3,}/i.test(s)) return "handle";
  if (/\b(whats ?app|instagram|insta|tiktok|snap(chat)?|discord|telegram|facebook)\b/i.test(s)) return "other app";
  return null;
}
const rid = (n = 12) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, b => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join(""); };
async function sha(s) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return Array.from(new Uint8Array(d), b => b.toString(16).padStart(2, "0")).join(""); }
function cors(req, env) {
  const o = req.headers.get("Origin") || "";
  const ok = (env.ORIGINS || "https://brogers36.github.io").split(",").map(s => s.trim());
  return { "Access-Control-Allow-Origin": ok.includes(o) ? o : ok[0], "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Admin", "Access-Control-Max-Age": "86400", "Vary": "Origin" };
}
const json = (obj, status, h) => new Response(JSON.stringify(obj), { status, headers: { ...h, "Content-Type": "application/json", "Cache-Control": "no-store" } });
const clean = t => String(t || "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim();

/* Message editing (2026-11-12) adds two columns to msgs: edited (time of the last edit) and orig (the text as first
   sent). Databases made before that get them here, once per Worker instance; schema.sql has them for new ones. */
let msgCols = false;
async function ensureMsgCols(DB) {
  if (msgCols) return;
  for (const c of ["edited INTEGER", "orig TEXT"]) { try { await DB.prepare("ALTER TABLE msgs ADD COLUMN " + c).run(); } catch (e) { /* already there */ } }
  msgCols = true;
}
const EDIT_WINDOW = 24 * 3600000;

async function who(DB, key) {
  if (!key || typeof key !== "string" || key.length > 80) return null;
  return await DB.prepare("SELECT id, nick, banned FROM users WHERE key_hash = ?").bind(await sha(key)).first();
}
function isAdmin(req, env) {
  const k = req.headers.get("X-Admin") || "";
  return !!env.ADMIN_KEY && k.length >= 16 && k === env.ADMIN_KEY;
}
function validOutfit(o) {
  if (!o || typeof o !== "object" || typeof o.p !== "string" || o.p.length > 40) return null;
  const out = {}; const src = o.o && typeof o.o === "object" ? o.o : {};
  const ks = Object.keys(src); if (ks.length > 14) return null;
  for (const k of ks) { const v = src[k]; if (!/^[a-z]{2,10}$/.test(k) || typeof v !== "string" || !/^[\p{L}\p{N}_ -]{1,40}$/u.test(v)) return null; out[k] = v; }
  return { p: o.p, o: out };
}
function validProgress(g) {
  if (!g || typeof g !== "object") return null; const out = {};
  for (const k of ["stars", "levels", "nuts", "items"]) { const v = Number(g[k]); if (!Number.isFinite(v) || v < 0 || v > 1e6) return null; out[k] = Math.round(v); }
  return out;
}
const postRow = r => ({ id: r.id, uid: r.uid, nick: r.nick, kind: r.kind, cat: r.cat, caption: r.caption, status: r.status, hidden: !!r.hidden, ts: r.ts,
  outfit: r.outfit ? JSON.parse(r.outfit) : null, progress: r.progress ? JSON.parse(r.progress) : null });

/* Moderator notifications through ntfy (https://ntfy.sh, a free app with no account). The secret NTFY_TOPIC names a
   private channel; the moderator's phone subscribes to it in the ntfy app. Only a short generic text is sent (never a
   nickname, a message or a photo), at most one per kind every 15 minutes, counting what came in meanwhile. Without
   NTFY_TOPIC nothing is sent. */
/* Where notifications go. Telegram (TG_TOKEN + TG_CHAT: a bot made with @BotFather, and the moderator's chat with it)
   is preferred: api.telegram.org answers Cloudflare Workers reliably. ntfy.sh (NTFY_TOPIC, optional NTFY_TOKEN) is
   kept as a fallback, but from Workers it often fails: its anonymous quota is per sending address, which Cloudflare
   shares (429), and connections can time out (522). */
const notifyOn = env => !!((env.TG_TOKEN && env.TG_CHAT) || env.NTFY_TOPIC);
const notifyVia = env => (env.TG_TOKEN && env.TG_CHAT) ? "telegram" : env.NTFY_TOPIC ? "ntfy" : null;
async function ntfySend(env, txt, tags) {
  const ADMIN_URL = "https://brogers36.github.io/Mapudungukeain/trawun/?admin";
  if (env.TG_TOKEN && env.TG_CHAT) {
    const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TG_CHAT, text: "Trawün: " + txt, disable_web_page_preview: true,
        reply_markup: { inline_keyboard: [[{ text: "Abrir moderación", url: ADMIN_URL }]] } }) });
    return { ok: r.ok, status: r.status, body: (await r.text()).slice(0, 300), via: "telegram" };
  }
  const hd = { "Title": "Trawün", "Tags": tags, "Click": ADMIN_URL };
  if (env.NTFY_TOKEN) hd["Authorization"] = "Bearer " + env.NTFY_TOKEN;
  const r = await fetch("https://ntfy.sh/" + encodeURIComponent(env.NTFY_TOPIC), { method: "POST", body: txt, headers: hd });
  return { ok: r.ok, status: r.status, body: (await r.text()).slice(0, 300), via: "ntfy" };
}
async function notify(env, DB, kind) {
  if (!notifyOn(env)) return;
  const now = Date.now(), k = "notify:" + kind;
  try {
    const row = await DB.prepare("SELECT v, n FROM meta WHERE k = ?").bind(k).first();
    const last = row ? Number(row.v) : 0, pend = (row ? Number(row.n) : 0) + 1;
    if (now - last < 15 * 60000) { await DB.prepare("INSERT INTO meta (k, v, n) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET n = ?").bind(k, String(last), pend, pend).run(); return; }
    const txt = kind === "photo" ? (pend > 1 ? `${pend} fotos nuevas esperan tu revisión.` : "Una foto nueva espera tu revisión.")
      : (pend > 1 ? `${pend} avisos nuevos (⚑) para revisar.` : "Alguien avisó (⚑) sobre un mensaje o una publicación.");
    const r = await ntfySend(env, txt, kind === "photo" ? "camera" : "triangular_flag_on_post");
    if (r.ok) {   /* the 15-minute window starts only after a notification really went out */
      await DB.prepare("INSERT INTO meta (k, v, n) VALUES (?, ?, 0) ON CONFLICT(k) DO UPDATE SET v = ?, n = 0").bind(k, String(now), String(now)).run();
      await DB.prepare("DELETE FROM meta WHERE k = 'notify:error'").run();
    } else {
      await DB.prepare("INSERT INTO meta (k, v, n) VALUES ('notify:error', ?, ?) ON CONFLICT(k) DO UPDATE SET v = ?, n = ?").bind(`ntfy ${r.status}: ${r.body}`, now, `ntfy ${r.status}: ${r.body}`, now).run();
      await DB.prepare("INSERT INTO meta (k, v, n) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET n = ?").bind(k, String(last), pend, pend).run();
    }
  } catch (e) {
    try { await DB.prepare("INSERT INTO meta (k, v, n) VALUES ('notify:error', ?, ?) ON CONFLICT(k) DO UPDATE SET v = ?, n = ?").bind(String(e && e.message || e).slice(0, 300), now, String(e && e.message || e).slice(0, 300), now).run(); } catch (e2) {}
  }
}

export default {
  async fetch(req, env, ctx) {
    const later = p => { if (ctx && ctx.waitUntil) ctx.waitUntil(p); };
    const h = cors(req, env), url = new URL(req.url), P = url.pathname;
    const DB = env.DB || Object.values(env).find(v => v && typeof v.prepare === "function" && typeof v.batch === "function");
    if (!DB) return json({ error: "no database bound" }, 500, h);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    try {
      const body = req.method === "POST" ? await req.json().catch(() => null) : null;
      if (req.method === "POST" && !body) return json({ error: "bad json" }, 400, h);
      const now = Date.now();

      if (P === "/join" && req.method === "POST") {
        const nick = clean(body.nick);
        if (!NICK_RE.test(nick) || privacyProblem(nick)) return json({ error: "bad nick" }, 400, h);
        const id = "u" + rid(10), key = rid(24);
        const r = await DB.prepare("INSERT OR IGNORE INTO users (id, nick, nick_lc, key_hash, created) VALUES (?, ?, ?, ?, ?)")
          .bind(id, nick, nick.toLowerCase(), await sha(key), now).run();
        if (!r.meta.changes) return json({ error: "taken" }, 409, h);
        return json({ id, nick, key }, 201, h);
      }

      if (P === "/msgs" && req.method === "GET") {
        const ch = url.searchParams.get("ch"); if (!CHANNELS.includes(ch)) return json({ error: "bad channel" }, 400, h);
        await ensureMsgCols(DB);
        const rs = await DB.prepare("SELECT id, ch, uid, nick, text, ts, edited FROM msgs WHERE ch = ? AND hidden = 0 ORDER BY ts DESC LIMIT 200").bind(ch).all();
        return json({ msgs: rs.results.reverse() }, 200, h);
      }
      if (P === "/msgs" && req.method === "POST") {
        const u = await who(DB, body.key); if (!u) return json({ error: "unknown" }, 401, h); if (u.banned) return json({ error: "blocked" }, 403, h);
        const ch = body.ch, text = clean(body.text).slice(0, MAX_TEXT);
        if (!CHANNELS.includes(ch) || !text) return json({ error: "bad message" }, 400, h);
        if (privacyProblem(text)) return json({ error: "personal data" }, 400, h);
        const rec = await DB.prepare("SELECT COUNT(*) AS n, MAX(ts) AS last FROM msgs WHERE uid = ? AND ts > ?").bind(u.id, now - 600000).first();
        if ((rec.last && now - rec.last < 3000) || rec.n >= 40) return json({ error: "slow down" }, 429, h);
        const id = "m" + rid(12);
        await DB.prepare("INSERT INTO msgs (id, ch, uid, nick, text, ts, hidden) VALUES (?, ?, ?, ?, ?, ?, 0)").bind(id, ch, u.id, u.nick, text, now).run();
        if (Math.random() < 0.02) await DB.prepare("DELETE FROM msgs WHERE ts < ?").bind(now - 180 * 86400000).run();   // keep about six months
        return json({ id }, 201, h);
      }
      if (P === "/msgs/edit" && req.method === "POST") {
        const u = await who(DB, body.key); if (!u) return json({ error: "unknown" }, 401, h); if (u.banned) return json({ error: "blocked" }, 403, h);
        const id = String(body.id || ""), text = clean(body.text).slice(0, MAX_TEXT);
        if (!/^m[a-z0-9]{12}$/.test(id) || !text) return json({ error: "bad message" }, 400, h);
        if (privacyProblem(text)) return json({ error: "personal data" }, 400, h);
        await ensureMsgCols(DB);
        const m0 = await DB.prepare("SELECT uid, text, ts, hidden, edited FROM msgs WHERE id = ?").bind(id).first();
        if (!m0 || m0.uid !== u.id || m0.hidden) return json({ error: "not yours" }, 404, h);
        if (now - m0.ts > EDIT_WINDOW) return json({ error: "too old" }, 403, h);
        if (m0.edited && now - m0.edited < 3000) return json({ error: "slow down" }, 429, h);
        if (text === m0.text) return json({ ok: true, edited: m0.edited || null }, 200, h);
        await DB.prepare("UPDATE msgs SET text = ?, edited = ?, orig = COALESCE(orig, ?) WHERE id = ?").bind(text, now, m0.text, id).run();
        return json({ ok: true, edited: now }, 200, h);
      }

      if (P === "/posts" && req.method === "GET") {
        const u = await who(DB, url.searchParams.get("key"));
        const rs = await DB.prepare("SELECT * FROM posts WHERE hidden = 0 AND (status = 'ok' OR uid = ?) ORDER BY ts DESC LIMIT 200").bind(u ? u.id : "-").all();
        return json({ posts: rs.results.map(postRow) }, 200, h);
      }
      if (P === "/posts" && req.method === "POST") {
        const u = await who(DB, body.key); if (!u) return json({ error: "unknown" }, 401, h); if (u.banned) return json({ error: "blocked" }, 403, h);
        const kind = body.kind, cat = CATS.includes(body.cat) ? body.cat : "otra", caption = clean(body.caption).slice(0, MAX_CAP);
        if (caption && privacyProblem(caption)) return json({ error: "personal data" }, 400, h);
        const day = await DB.prepare("SELECT COUNT(*) AS n, SUM(kind = 'photo') AS ph FROM posts WHERE uid = ? AND ts > ?").bind(u.id, now - 86400000).first();
        if (day.n >= 20 || (kind === "photo" && day.ph >= 5)) return json({ error: "too many" }, 429, h);
        const id = "p" + rid(12);
        let outfit = null, progress = null, status = "ok";
        if (kind === "outfit") { outfit = validOutfit(body.outfit); if (!outfit) return json({ error: "bad outfit" }, 400, h); }
        else if (kind === "progress") { progress = validProgress(body.progress); if (!progress) return json({ error: "bad progress" }, 400, h); }
        else if (kind === "photo") {
          if (typeof body.image !== "string" || body.image.length > MAX_IMG * 1.4) return json({ error: "bad image" }, 400, h);
          let bytes; try { bytes = Uint8Array.from(atob(body.image), c => c.charCodeAt(0)); } catch (e) { return json({ error: "bad image" }, 400, h); }
          if (bytes.length > MAX_IMG || bytes[0] !== 0xff || bytes[1] !== 0xd8) return json({ error: "bad image" }, 400, h);   // JPEG only, as the page makes them
          await DB.prepare("INSERT INTO imgs (id, data) VALUES (?, ?)").bind(id, bytes).run();
          status = "pending";
          later(notify(env, DB, "photo"));
        } else return json({ error: "bad kind" }, 400, h);
        await DB.prepare("INSERT INTO posts (id, uid, nick, kind, cat, caption, outfit, progress, status, hidden, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)")
          .bind(id, u.id, u.nick, kind, cat, caption, outfit && JSON.stringify(outfit), progress && JSON.stringify(progress), status, now).run();
        return json({ id, status, uid: u.id, nick: u.nick, kind, cat, caption, outfit, progress, ts: now }, 201, h);
      }

      let m = P.match(/^\/img\/(p[a-z0-9]{12})$/);
      if (m && req.method === "GET") {
        const p = await DB.prepare("SELECT uid, status, hidden FROM posts WHERE id = ?").bind(m[1]).first();
        if (!p || p.hidden) return json({ error: "not found" }, 404, h);
        if (p.status !== "ok") { const u = await who(DB, url.searchParams.get("key")); if (!u || u.id !== p.uid) return json({ error: "not found" }, 404, h); }
        const im = await DB.prepare("SELECT data FROM imgs WHERE id = ?").bind(m[1]).first();
        if (!im) return json({ error: "not found" }, 404, h);
        return new Response(new Uint8Array(im.data), { headers: { ...h, "Content-Type": "image/jpeg", "Cache-Control": p.status === "ok" ? "public, max-age=86400" : "no-store" } });
      }

      if (P === "/report" && req.method === "POST") {
        const u = await who(DB, body.key); if (!u) return json({ error: "unknown" }, 401, h);
        const type = body.type, id = String(body.id || ""); if (!["msg", "post"].includes(type) || !/^[mp][a-z0-9]{12}$/.test(id)) return json({ error: "bad report" }, 400, h);
        const ins = await DB.prepare("INSERT OR IGNORE INTO reports (type, item, uid, ts) VALUES (?, ?, ?, ?)").bind(type, id, u.id, now).run();
        if (ins.meta.changes) later(notify(env, DB, "report"));
        const n = (await DB.prepare("SELECT COUNT(*) AS n FROM reports WHERE type = ? AND item = ?").bind(type, id).first()).n;
        if (n >= 3) await DB.prepare(`UPDATE ${type === "msg" ? "msgs" : "posts"} SET hidden = 1 WHERE id = ?`).bind(id).run();
        return json({ ok: true }, 200, h);
      }

      if (P.startsWith("/admin/")) {
        if (!isAdmin(req, env)) return json({ error: "unauthorized" }, 401, h);
        if (P === "/admin/queue" && req.method === "GET") {
          const posts = await DB.prepare("SELECT * FROM posts WHERE status = 'pending' OR hidden = 1 OR id IN (SELECT item FROM reports WHERE type = 'post') ORDER BY ts DESC LIMIT 200").all();
          await ensureMsgCols(DB);
          const msgs = await DB.prepare("SELECT id, ch, uid, nick, text, ts, hidden, edited, orig FROM msgs WHERE hidden = 1 OR id IN (SELECT item FROM reports WHERE type = 'msg') ORDER BY ts DESC LIMIT 300").all();
          const reps = await DB.prepare("SELECT type, item, uid FROM reports").all(); const reports = {};
          for (const r of reps.results) (reports[r.type + ":" + r.item] = reports[r.type + ":" + r.item] || []).push(r.uid);
          let nerr = null; try { nerr = await DB.prepare("SELECT v, n FROM meta WHERE k = 'notify:error'").first(); } catch (e) { nerr = { v: "meta table missing: run schema.sql", n: 0 }; }
          return json({ posts: posts.results.map(postRow), msgs: msgs.results.map(x => ({ ...x, hidden: !!x.hidden })), reports,
            notify: { configured: notifyOn(env), via: notifyVia(env), error: nerr ? nerr.v : null, errorAt: nerr ? nerr.n : null } }, 200, h);
        }
        if (P === "/admin/notify-test" && req.method === "POST") {   /* the moderation page's "test notification" button */
          if (!notifyOn(env)) return json({ configured: false }, 200, h);
          let r; try { r = await ntfySend(env, "Prueba: los avisos de Trawün funcionan.", "white_check_mark"); } catch (e) { r = { ok: false, status: 0, body: String(e && e.message || e) }; }
          return json({ configured: true, ...r }, 200, h);
        }
        if (P === "/admin/act" && req.method === "POST") {
          const { type, id, action } = body; const T = type === "msg" ? "msgs" : type === "post" ? "posts" : null;
          if (!T || !/^[mp][a-z0-9]{12}$/.test(String(id))) return json({ error: "bad request" }, 400, h);
          if (action === "approve") {
            await DB.batch([DB.prepare(`UPDATE ${T} SET hidden = 0${T === "posts" ? ", status = 'ok'" : ""} WHERE id = ?`).bind(id),
              DB.prepare("DELETE FROM reports WHERE type = ? AND item = ?").bind(type, id)]);
          } else if (action === "hide") await DB.prepare(`UPDATE ${T} SET hidden = 1 WHERE id = ?`).bind(id).run();
          else if (action === "delete") {
            const q = [DB.prepare(`DELETE FROM ${T} WHERE id = ?`).bind(id), DB.prepare("DELETE FROM reports WHERE type = ? AND item = ?").bind(type, id)];
            if (T === "posts") q.push(DB.prepare("DELETE FROM imgs WHERE id = ?").bind(id));
            await DB.batch(q);
          } else if (action === "ban") {
            const row = await DB.prepare(`SELECT uid FROM ${T} WHERE id = ?`).bind(id).first(); if (!row) return json({ error: "not found" }, 404, h);
            await DB.batch([DB.prepare("UPDATE users SET banned = 1 WHERE id = ?").bind(row.uid), DB.prepare("UPDATE msgs SET hidden = 1 WHERE uid = ?").bind(row.uid),
              DB.prepare("UPDATE posts SET hidden = 1 WHERE uid = ?").bind(row.uid)]);
          } else return json({ error: "bad action" }, 400, h);
          return json({ ok: true }, 200, h);
        }
        m = P.match(/^\/admin\/img\/(p[a-z0-9]{12})$/);
        if (m && req.method === "GET") {
          const im = await DB.prepare("SELECT data FROM imgs WHERE id = ?").bind(m[1]).first();
          if (!im) return json({ error: "not found" }, 404, h);
          return new Response(new Uint8Array(im.data), { headers: { ...h, "Content-Type": "image/jpeg", "Cache-Control": "no-store" } });
        }
      }
      return json({ error: "not found" }, 404, h);
    } catch (e) {
      return json({ error: "server" }, 500, h);
    }
  }
};
