// One-step setup of Trawün (the community page's service) on Cloudflare, from your own computer.
// Needs Node.js 18+. Run from anywhere:   node tools/trawun/deploy.mjs
// It opens the browser once so you can authorize Wrangler with your Cloudflare account, then it creates the database
// (if it doesn't exist), creates the table, publishes the Worker with the database connected, and prints its address.
import { execSync } from "node:child_process";
import { createInterface } from "node:readline";
import { readFileSync, writeFileSync, mkdtempSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const W = "npx --yes wrangler@4";
const NAME = "mapudungukeain-trawun";
const run = (cmd, opts = {}) => execSync(cmd, { stdio: opts.quiet ? "pipe" : "inherit", encoding: "utf8", cwd: opts.cwd, env: { ...process.env, WRANGLER_SEND_METRICS: "false" } });

console.log("\n1/6  Cuenta de Cloudflare…");
/* Uses the Cloudflare account you sign in to in the browser. If this computer is already signed in, it shows which
   account that is and asks before using it; answer "n" to sign out and sign in to another one (for example a new account).
   MPK_CF_OK=1 skips the question (publicar_servicios.mjs sets it after asking once). */
const ask = q => new Promise(res => { const rl = createInterface({ input: process.stdin, output: process.stdout }); rl.question(q, a => { rl.close(); res(a.trim().toLowerCase()); }); });
let who = ""; try { who = run(`${W} whoami`, { quiet: true }); } catch { who = ""; }
if (!/You are logged in/i.test(who)) run(`${W} login`);
else if (process.env.MPK_CF_OK !== "1") {
  console.log(who.split("\n").filter(l => /logged in|@|Account Name|│/.test(l)).join("\n"));
  if (!/^s/.test(await ask("\n¿Usar esta cuenta? (s/n) "))) { run(`${W} logout`); run(`${W} login`); }
}

console.log("\n2/6  Base de datos…");
const findDb = () => { try { return JSON.parse(run(`${W} d1 list --json`, { quiet: true })).find(d => d.name === NAME); } catch { return null; } };
let db = findDb();
if (!db) { run(`${W} d1 create ${NAME}`); db = findDb(); }
if (!db) { console.error("No pude crear ni encontrar la base de datos. Copia lo que salió arriba y mándamelo."); process.exit(1); }
const id = db.uuid || db.id || db.database_id;
console.log("     base:", NAME, id);

// work in a temporary folder so the repository's wrangler.toml stays unchanged
const tmp = mkdtempSync(join(tmpdir(), "mpk-trawun-"));
for (const f of ["worker.js", "schema.sql"]) copyFileSync(join(here, f), join(tmp, f));
writeFileSync(join(tmp, "wrangler.toml"), readFileSync(join(here, "wrangler.toml"), "utf8").replace("REPLACE_WITH_DATABASE_ID", id));

console.log("\n3/6  Tabla…");
run(`${W} d1 execute ${NAME} --remote --file schema.sql --yes`, { cwd: tmp });

console.log("\n4/6  Publicando el servicio…");
const out = run(`${W} deploy`, { cwd: tmp, quiet: true });
process.stdout.write(out);
const url = (out.match(/https:\/\/[\w.-]+\.workers\.dev/) || [])[0];

console.log("\n5/6  Clave de moderación y avisos…");
// Secrets already set on Cloudflare are kept, so running this again (to update the service) never changes your key.
// The moderator key is made here at random, set as a Cloudflare secret and shown once. So is the private ntfy channel
// for notifications. "--nueva-clave" or "--nuevo-aviso" replace them on purpose.
const { randomBytes } = await import("node:crypto");
let have = [];
try { have = JSON.parse(run(`${W} secret list --format json`, { cwd: tmp, quiet: true })).map(x => x.name); } catch { have = []; }
const putSecret = (name, value) => execSync(`${W} secret put ${name}`, { cwd: tmp, input: value, stdio: ["pipe", "inherit", "inherit"], env: { ...process.env, WRANGLER_SEND_METRICS: "false" } });
let ADMIN = null, TOPIC = null;
if (!have.includes("ADMIN_KEY") || process.argv.includes("--nueva-clave")) { ADMIN = randomBytes(18).toString("base64url"); putSecret("ADMIN_KEY", ADMIN); }
else console.log("     la clave de moderación ya existe: se mantiene la misma");
// --token-aviso: paste the access token of a free ntfy.sh account (Account → Access tokens), so the notifications use
// that account's own daily allowance instead of the shared, often exhausted, anonymous one.
if (process.argv.includes("--token-aviso")) {
  const askRaw = q => new Promise(res => { const rl = createInterface({ input: process.stdin, output: process.stdout }); rl.question(q, a => { rl.close(); res(a); }); });   // tokens are case-sensitive
  const tok = await askRaw("\nPega aquí el token de acceso de ntfy (empieza con tk_) y presiona Enter: ");
  if (/^tk_[A-Za-z0-9]{10,}$/.test(tok.trim())) { putSecret("NTFY_TOKEN", tok.trim()); console.log("     token guardado en Cloudflare"); }
  else console.log("     eso no parece un token de ntfy (empieza con tk_); no se guardó nada");
}
if (!have.includes("NTFY_TOPIC") || process.argv.includes("--nuevo-aviso")) { TOPIC = "trawun-" + randomBytes(12).toString("hex"); putSecret("NTFY_TOPIC", TOPIC); }
else console.log("     el canal de avisos ya existe: se mantiene el mismo");

console.log("\n6/6  Comprobando…");
if (url) {
  try { const r = await fetch(url + "/msgs?ch=mapu"); console.log("     respuesta:", await r.text()); } catch (e) { console.log("     (no pude comprobarlo desde aquí:", e.message + ")"); }
  console.log("\nListo. Dirección del servicio:\n\n     " + url + "\n\nMándame esa dirección (solo la dirección).");
  if (ADMIN) console.log("\nTu clave de moderación (guárdala; no la mandes a nadie, tampoco a mí):\n\n     " + ADMIN + "\n");
  if (TOPIC) console.log("\nAvisos en el teléfono: instala la app «ntfy» (Android o iPhone), toca «+» y suscríbete a este canal\n(servidor ntfy.sh). Guárdalo; es privado como la clave:\n\n     " + TOPIC + "\n");
  console.log("Para moderar: abre https://brogers36.github.io/Mapudungukeain/trawun/?admin y pega la clave.");
} else {
  console.log("\nPublicado, pero no encontré la dirección en la salida de arriba. Búscala (termina en .workers.dev) y mándamela.");
}
