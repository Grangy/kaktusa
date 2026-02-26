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
// Один и тот же ключ при сборке и в runtime — избавляет от "Failed to find Server Action" после деплоя
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

  console.log("\n🔧 HARD DEPLOY (полный: npm ci, prisma, build, nginx)\n");

  let stepStart = Date.now();
  console.log("=== 1/5 Git pull на сервере ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && git fetch origin && git reset --hard origin/main"`
  );
  audit.push({ name: "1. Git pull", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  if (existsSync(DB_PATH)) {
    stepStart = Date.now();
    console.log("=== 2/5 Копирование БД на сервер ===");
    await run(
      `ssh ${SSH_OPTS} ${USER}@${SERVER} "mkdir -p ${REMOTE}/prisma"`
    );
    await run(
      `scp ${SSH_OPTS} "${DB_PATH}" ${USER}@${SERVER}:${REMOTE_DB}`
    );
    audit.push({ name: "2. Копирование БД", s: ((Date.now() - stepStart) / 1000).toFixed(1) });
  } else {
    console.log("=== 2/5 Локальная БД не найдена (prisma/dev.db) ===");
  }

  const schemaCheck = await new Promise((resolve) => {
    const p = spawn("sh", ["-c", `ssh ${SSH_OPTS} ${USER}@${SERVER} "test -f ${REMOTE}/prisma/schema.prisma"`], { stdio: "ignore" });
    p.on("exit", (c) => resolve(c === 0));
  });
  if (!schemaCheck) {
    console.error("\n❌ На сервере нет prisma/schema.prisma.");
    console.error("   git add prisma ... && git commit && git push, затем npm run deploy:hard\n");
    process.exit(1);
  }

  stepStart = Date.now();
  console.log("=== 3/5 npm ci + Prisma + Build (самый долгий этап) ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && export DATABASE_URL='${DATABASE_URL}' && export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY='${SERVER_ACTIONS_KEY}' && mkdir -p prisma && npm ci --no-audit --no-fund && npx prisma generate && npx prisma db push && npm run build"`
  );
  audit.push({ name: "3. npm ci + prisma + build", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  stepStart = Date.now();
  console.log("=== 4/5 PM2 restart ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && pm2 delete kaktusa 2>/dev/null; pm2 start ecosystem.config.cjs && pm2 save"`
  );
  audit.push({ name: "4. PM2 restart", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  stepStart = Date.now();
  console.log("=== 5/5 Nginx ===");
  const nginxConf = join(__dir, "nginx-tusa.conf");
  if (existsSync(nginxConf)) {
    await run(`scp ${SSH_OPTS} "${nginxConf}" ${USER}@${SERVER}:/etc/nginx/sites-available/tusa.grangy.ru`);
    await run(
      `ssh ${SSH_OPTS} ${USER}@${SERVER} "ln -sf /etc/nginx/sites-available/tusa.grangy.ru /etc/nginx/sites-enabled/ 2>/dev/null; nginx -t && systemctl reload nginx"`
    );
    audit.push({ name: "5. Nginx", s: ((Date.now() - stepStart) / 1000).toFixed(1) });
  }

  const total = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n📊 Аудит деплоя:");
  audit.forEach(({ name, s }) => console.log(`   ${name}: ${s}s`));
  console.log(`   ─────────────────`);
  console.log(`   ИТОГО: ${total}s\n`);
  console.log("💡 Для быстрого обновления кода без npm ci/prisma: npm run deploy:light\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
