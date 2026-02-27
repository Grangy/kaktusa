#!/usr/bin/env node
/**
 * Запуск настройки SSL на сервере (один раз).
 * Требует: домены kaktusa.ru, www.kaktusa.ru указывают на сервер.
 * Запуск: node deploy/ssl-remote.mjs
 * Требует DEPLOY_SERVER, DEPLOY_SSH_KEY в .env.
 */
import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
try {
  const envPath = join(root, ".env");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
} catch {}

const SERVER = process.env.DEPLOY_SERVER;
const KEY = process.env.DEPLOY_SSH_KEY;
const USER = process.env.DEPLOY_USER || "root";
if (!SERVER || !KEY) {
  console.error("❌ Задайте DEPLOY_SERVER и DEPLOY_SSH_KEY в .env.");
  process.exit(1);
}
const SSH_OPTS = `-i ${KEY} -o StrictHostKeyChecking=no -o ConnectTimeout=30`;

function run(cmd) {
  return new Promise((resolve, reject) => {
    const p = spawn("sh", ["-c", cmd], { stdio: "inherit" });
    p.on("exit", (c) => (c === 0 ? resolve() : reject(new Error(`Exit ${c}`))));
  });
}

async function main() {
  const setupPath = join(__dir, "ssl-setup.sh");
  if (!existsSync(setupPath)) throw new Error("deploy/ssl-setup.sh not found");
  console.log("Копируем ssl-setup.sh на сервер и запускаем...\n");
  await run(`scp ${SSH_OPTS} "${setupPath}" ${USER}@${SERVER}:/root/ssl-setup.sh`);
  await run(`ssh ${SSH_OPTS} ${USER}@${SERVER} "chmod +x /root/ssl-setup.sh && /root/ssl-setup.sh"`);
  console.log("\n✅ SSL настроен. Проверьте https://kaktusa.ru");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
