#!/usr/bin/env node
/**
 * Обновление на сервере: git pull → build → pm2 restart.
 * Без npm ci и без nginx. Запуск: node deploy/update.mjs
 */
import { spawn } from "child_process";

const SERVER = "89.125.37.62";
const USER = "root";
const KEY = process.env.HOME + "/.ssh/shared_server_key";
const REMOTE = "/var/www/kaktusa";
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
