// Publishes the two online extras of the apps on Cloudflare, in one go, from your own computer:
//   1. the online copy of game progress (tools/sync)      2. Trawün, the community page's service (tools/trawun)
// The game and the dictionary are NOT moved to Cloudflare: they stay on GitHub Pages and keep working fully offline.
// These two services are extras that only matter when there is internet; without it the apps carry on as before.
// Needs Node.js 18+. Run:   node tools/publicar_servicios.mjs
import { execSync } from "node:child_process";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url)), W = "npx --yes wrangler@4";
const env = { ...process.env, WRANGLER_SEND_METRICS: "false" };
const run = (cmd, quiet) => execSync(cmd, { stdio: quiet ? "pipe" : "inherit", encoding: "utf8", env });
const ask = q => new Promise(res => { const rl = createInterface({ input: process.stdin, output: process.stdout }); rl.question(q, a => { rl.close(); res(a.trim().toLowerCase()); }); });

console.log("\nCuenta de Cloudflare. Si quieres usar una cuenta nueva, créala primero en https://dash.cloudflare.com/sign-up");
let who = ""; try { who = run(`${W} whoami`, true); } catch { who = ""; }
if (/You are logged in/i.test(who)) {
  console.log(who.split("\n").filter(l => /logged in|@|Account Name|│/.test(l)).join("\n"));
  if (!/^s/.test(await ask("\n¿Usar esta cuenta? (s/n) "))) { run(`${W} logout`); run(`${W} login`); }
} else run(`${W} login`);
env.MPK_CF_OK = "1";
for (const [name, dir] of [["Copia en línea del progreso", "sync"], ["Trawün", "trawun"]]) {
  console.log(`\n================  ${name}  ================`);
  execSync(`node ${JSON.stringify(join(here, dir, "deploy.mjs"))}`, { stdio: "inherit", env });
}
console.log("\nListo. Mándame las dos direcciones (.workers.dev). La clave de moderación de Trawün es solo para ti.");
