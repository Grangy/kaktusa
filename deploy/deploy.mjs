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
const root = join(__dir, "..");
const SERVER = "89.125.37.62";
const USER = "root";
const KEY = process.env.HOME + "/.ssh/shared_server_key";
const REMOTE = "/var/www/kaktusa";
const SSH_OPTS = `-i ${KEY} -o StrictHostKeyChecking=no -o ConnectTimeout=30`;
const DB_PATH = join(root, "prisma", "dev.db");
const REMOTE_DB = `${REMOTE}/prisma/dev.db`;
const DATABASE_URL = `file:${REMOTE}/prisma/dev.db`;

function run(cmd) {
  return new Promise((resolve, reject) => {
    const p = spawn("sh", ["-c", cmd], { stdio: "inherit" });
    p.on("exit", (c) => (c === 0 ? resolve() : reject(new Error(`Exit ${c}`))));
  });
}

async function main() {
  const start = Date.now();

  console.log("=== 1/5 Git pull на сервере ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && git fetch origin && git reset --hard origin/main"`
  );

  if (existsSync(DB_PATH)) {
    console.log("=== 2/5 Копирование БД на сервер ===");
    await run(
      `ssh ${SSH_OPTS} ${USER}@${SERVER} "mkdir -p ${REMOTE}/prisma"`
    );
    await run(
      `scp ${SSH_OPTS} "${DB_PATH}" ${USER}@${SERVER}:${REMOTE_DB}`
    );
  } else {
    console.log("=== 2/5 Локальная БД не найдена (prisma/dev.db), на сервере будет создана по схеме ===");
  }

  console.log("=== 3/5 Install, Prisma, Build на сервере ===");
  const schemaCheck = await new Promise((resolve) => {
    const p = spawn("sh", ["-c", `ssh ${SSH_OPTS} ${USER}@${SERVER} "test -f ${REMOTE}/prisma/schema.prisma"`], { stdio: "ignore" });
    p.on("exit", (c) => resolve(c === 0));
  });
  if (!schemaCheck) {
    console.error("\n❌ На сервере нет prisma/schema.prisma (в репозитории не запушена папка prisma).");
    console.error("   Сделайте: git add prisma src deploy ecosystem.config.cjs ... && git commit -m '...' && git push");
    console.error("   Затем снова: npm run deploy\n");
    process.exit(1);
  }
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && export DATABASE_URL='${DATABASE_URL}' && mkdir -p prisma && npm ci --no-audit --no-fund && npx prisma generate && npx prisma db push && npm run build && npm prune --omit=dev"`
  );

  console.log("=== 4/5 PM2 restart ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && pm2 restart ecosystem.config.cjs 2>/dev/null || pm2 start ecosystem.config.cjs; pm2 save"`
  );

  console.log("=== 5/5 Nginx (kaktusa.ru) ===");
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
