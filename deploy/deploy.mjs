#!/usr/bin/env node
/**
 * Деплой через Git: на сервере git pull → npm ci → build → pm2 restart.
 * Репозиторий: https://github.com/Grangy/kaktusa
 * Локально: git add & commit & push, затем node deploy/deploy.mjs
 */
import { spawn } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
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

  console.log("=== 1/4 Git pull на сервере ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && git fetch origin && git reset --hard origin/main"`
  );

  console.log("=== 2/4 Install & Build на сервере ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && npm ci --no-audit --no-fund && npm run build && npm prune --omit=dev"`
  );

  console.log("=== 3/4 PM2 restart ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && pm2 restart ecosystem.config.cjs 2>/dev/null || pm2 start ecosystem.config.cjs; pm2 save"`
  );

  console.log("=== 4/4 Nginx (kaktusa.ru) ===");
  const nginxConf = join(__dir, "nginx-tusa.conf");
  if (existsSync(nginxConf)) {
    await run(`scp ${SSH_OPTS} "${nginxConf}" ${USER}@${SERVER}:/etc/nginx/sites-available/tusa.grangy.ru`);
    await run(
      `ssh ${SSH_OPTS} ${USER}@${SERVER} "ln -sf /etc/nginx/sites-available/tusa.grangy.ru /etc/nginx/sites-enabled/ 2>/dev/null; nginx -t && systemctl reload nginx"`
    );
  }

  console.log(`\n✅ Deploy done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
