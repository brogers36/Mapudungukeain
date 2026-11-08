/* Progress sync for Mapudungukeaiñ Fill Püle (Cloudflare Worker + D1).
   A player's progress is stored under a random sync code, which works like a password: whoever has the code can read
   and replace that progress. No names, emails or other personal data are stored, only the game's own save data.

   POST /new            -> {code, updated}                 creates an empty record
   GET  /p/CODE         -> {data, updated} | 404
   PUT  /p/CODE  {data, base}  -> {updated} | 404 | 409 {updated}   base = the "updated" value the client last saw;
                                                                     a newer record on the server is not overwritten
                                                                     unless base is "force"
   Binding: a D1 database (named DB, or any name). Variable: ORIGINS (comma-separated allowed origins). */
const ALPH = "23456789abcdefghjkmnpqrstuvwxyz";          // no 0/o, 1/l/i
const WORDS = ["kawellu", "ruka", "mapu", "lafken", "kürüf", "pewen", "antü", "küyen", "wenu", "mawida", "rayen", "trayenko",
  "kulliñ", "challa", "ketran", "ñamku", "choike", "pangi", "nawel", "lemu", "lif", "kütral", "mawün", "pire"]
  .map(w => w.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ñ/g, "n"));
const MAX = 256 * 1024;                                  // bytes of save data per player
const CODE_RE = /^[a-z]{2,12}-[2-9a-hjkmnp-z]{4}-[2-9a-hjkmnp-z]{4}$/;

function rnd(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; }
function newCode() {
  const r = rnd(9);
  const part = i => Array.from(r.slice(i, i + 4), b => ALPH[b % ALPH.length]).join("");
  return WORDS[r[8] % WORDS.length] + "-" + part(0) + "-" + part(4);   // 31^8 ≈ 8.5e11 per word
}
function cors(req, env) {
  const o = req.headers.get("Origin") || "";
  const ok = (env.ORIGINS || "https://brogers36.github.io").split(",").map(s => s.trim());
  return { "Access-Control-Allow-Origin": ok.includes(o) ? o : ok[0], "Access-Control-Allow-Methods": "GET,PUT,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400", "Vary": "Origin" };
}
const json = (obj, status, h) => new Response(JSON.stringify(obj), { status, headers: { ...h, "Content-Type": "application/json" } });

export default {
  async fetch(req, env) {
    const h = cors(req, env), url = new URL(req.url);
    /* the D1 database: bound as DB, or under whatever name the dashboard gave it */
    const DB = env.DB || Object.values(env).find(v => v && typeof v.prepare === "function" && typeof v.batch === "function");
    if (!DB) return json({ error: "no database bound" }, 500, h);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    try {
      if (req.method === "POST" && url.pathname === "/new") {
        for (let i = 0; i < 5; i++) {
          const code = newCode(), now = Date.now();
          const r = await DB.prepare("INSERT OR IGNORE INTO progress (code, data, updated, created) VALUES (?, '{}', ?, ?)")
            .bind(code, now, now).run();
          if (r.meta.changes) return json({ code, updated: now }, 201, h);
        }
        return json({ error: "busy" }, 503, h);
      }
      const m = url.pathname.match(/^\/p\/([^/]+)$/);
      if (m) {
        const code = decodeURIComponent(m[1]).toLowerCase();
        if (!CODE_RE.test(code)) return json({ error: "bad code" }, 404, h);
        if (req.method === "GET") {
          const row = await DB.prepare("SELECT data, updated FROM progress WHERE code = ?").bind(code).first();
          if (!row) return json({ error: "not found" }, 404, h);
          return json({ data: JSON.parse(row.data), updated: row.updated }, 200, h);
        }
        if (req.method === "PUT") {
          const text = await req.text();
          if (text.length > MAX) return json({ error: "too large" }, 413, h);
          let body; try { body = JSON.parse(text); } catch (e) { return json({ error: "bad json" }, 400, h); }
          const data = body && body.data;
          if (!data || typeof data !== "object" || Array.isArray(data)) return json({ error: "bad data" }, 400, h);
          for (const [k, v] of Object.entries(data)) if (!/^mpk_[\w.-]{1,40}$/.test(k) || typeof v !== "string") return json({ error: "bad key" }, 400, h);
          const row = await DB.prepare("SELECT updated FROM progress WHERE code = ?").bind(code).first();
          if (!row) return json({ error: "not found" }, 404, h);
          if (body.base !== "force" && Number(body.base) !== row.updated) return json({ error: "conflict", updated: row.updated }, 409, h);
          const now = Math.max(Date.now(), row.updated + 1);
          await DB.prepare("UPDATE progress SET data = ?, updated = ? WHERE code = ?").bind(JSON.stringify(data), now, code).run();
          return json({ updated: now }, 200, h);
        }
      }
      return json({ error: "not found" }, 404, h);
    } catch (e) {
      return json({ error: "server" }, 500, h);
    }
  }
};
