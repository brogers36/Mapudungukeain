// One-step setup of the progress-sync service on Cloudflare, from your own computer.
// Needs Node.js 18+. Run from anywhere:   node tools/sync/deploy.mjs
// It opens the browser once so you can authorize Wrangler with your Cloudflare account, then it creates the database
// (if it doesn't exist), creates the table, publishes the Worker with the database connected, and prints its address.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const W = "npx --yes wrangler@4";
const NAME = "mapudungukeain-sync";
const run = (cmd, opts = {}) => execSync(cmd, { stdio: opts.quiet ? "pipe" : "inherit", encoding: "utf8", cwd: opts.cwd, env: { ...process.env, WRANGLER_SEND_METRICS: "false" } });

console.log("\n1/5  Iniciando sesión en Cloudflare (se abre el navegador; acepta y vuelve aquí)…");
try { run(`${W} whoami`, { quiet: true }).includes("You are logged in") || run(`${W} login`); } catch { run(`${W} login`); }

console.log("\n2/5  Base de datos…");
const findDb = () => { try { return JSON.parse(run(`${W} d1 list --json`, { quiet: true })).find(d => d.name === NAME); } catch { return null; } };
let db = findDb();
if (!db) { run(`${W} d1 create ${NAME}`); db = findDb(); }
if (!db) { console.error("No pude crear ni encontrar la base de datos. Copia lo que salió arriba y mándamelo."); process.exit(1); }
const id = db.uuid || db.id || db.database_id;
console.log("     base:", NAME, id);

// work in a temporary folder so the repository's wrangler.toml stays unchanged
const tmp = mkdtempSync(join(tmpdir(), "mpk-sync-"));
for (const f of ["worker.js", "schema.sql"]) copyFileSync(join(here, f), join(tmp, f));
writeFileSync(join(tmp, "wrangler.toml"), readFileSync(join(here, "wrangler.toml"), "utf8").replace("REPLACE_WITH_DATABASE_ID", id));

console.log("\n3/5  Tabla…");
run(`${W} d1 execute ${NAME} --remote --file schema.sql --yes`, { cwd: tmp });

console.log("\n4/5  Publicando el servicio…");
const out = run(`${W} deploy`, { cwd: tmp, quiet: true });
process.stdout.write(out);
const url = (out.match(/https:\/\/[\w.-]+\.workers\.dev/) || [])[0];

console.log("\n5/5  Comprobando…");
if (url) {
  try { const r = await fetch(url + "/p/x"); console.log("     respuesta:", await r.text()); } catch (e) { console.log("     (no pude comprobarlo desde aquí:", e.message + ")"); }
  console.log("\nListo. Dirección del servicio:\n\n     " + url + "\n\nMándame esa dirección.");
} else {
  console.log("\nPublicado, pero no encontré la dirección en la salida de arriba. Búscala (termina en .workers.dev) y mándamela.");
}
