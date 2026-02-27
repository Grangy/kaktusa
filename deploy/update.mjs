#!/usr/bin/env node
/**
 * Обновление на сервере: git pull → build → pm2 restart.
 * Без npm ci и без nginx. Запуск: node deploy/update.mjs
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
const USER = process.env.DEPLOY_USER || "root";
const KEY = process.env.DEPLOY_SSH_KEY;
const REMOTE = process.env.DEPLOY_REMOTE || "/var/www/kaktusa";
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
  const start = Date.now();

  console.log("=== 1/3 Git pull ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && git fetch origin && git reset --hard origin/main"`
  );

  console.log("=== 2/3 Build ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && npm install --no-audit --no-fund && npm run build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/"`
  );

  console.log("=== 3/3 PM2 restart ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && pm2 restart ecosystem.config.cjs && pm2 save"`
  );

  console.log(`\n✅ Update done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
