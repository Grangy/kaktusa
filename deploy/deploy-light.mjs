#!/usr/bin/env node
/**
 * Лайт-деплой: git pull → prisma migrate deploy → build → pm2 restart.
 * Без: npm ci, nginx. Миграции применяются, данные сохраняются.
 * Использовать когда менялся только код (src/), а не package.json.
 * Если добавлены зависимости — запустить deploy.
 */
import { spawn } from "child_process";

const SERVER = "89.125.37.62";
const USER = "root";
const KEY = process.env.HOME + "/.ssh/shared_server_key";
const REMOTE = "/var/www/kaktusa";
const SSH_OPTS = `-i ${KEY} -o StrictHostKeyChecking=no -o ConnectTimeout=30`;
const DATABASE_URL = `file:${REMOTE}/prisma/dev.db`;
const SERVER_ACTIONS_KEY = "<REMOVED>";

function run(cmd) {
  return new Promise((resolve, reject) => {
    const p = spawn("sh", ["-c", cmd], { stdio: "inherit" });
    p.on("exit", (c) => (c === 0 ? resolve() : reject(new Error(`Exit ${c}`))));
  });
}

async function main() {
  const start = Date.now();
  const audit = [];

  console.log("\n⚡ LIGHT DEPLOY (только git pull + build + pm2)\n");

  let stepStart = Date.now();
  console.log("=== 1/3 Git pull ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && git fetch origin && git reset --hard origin/main"`
  );
  audit.push({ name: "1. Git pull", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  stepStart = Date.now();
  console.log("=== 2/3 Prisma migrate deploy + Build ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && export NODE_ENV=production && export DATABASE_URL='${DATABASE_URL}' && export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY='${SERVER_ACTIONS_KEY}' && npx prisma migrate deploy && npx prisma generate && npm run db:seed && npm run build && mkdir -p public/photos && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && rm -rf .next/standalone/public/photos && ln -sfn ${REMOTE}/public/photos .next/standalone/public/photos"`
  );
  audit.push({ name: "2. Prisma migrate + build", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  stepStart = Date.now();
  console.log("=== 3/3 PM2 restart ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && pm2 restart ecosystem.config.cjs && pm2 save"`
  );
  audit.push({ name: "3. PM2 restart", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  const total = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n📊 Аудит лайт-деплоя:");
  audit.forEach(({ name, s }) => console.log(`   ${name}: ${s}s`));
  console.log(`   ─────────────────`);
  console.log(`   ИТОГО: ${total}s\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
