#!/usr/bin/env node
/**
 * Деплой: git pull → npm ci → prisma db push + generate → db:seed → build → pm2.
 * БД на сервере: только db push (схема). seed НЕ запускается — данные прода не трогаются.
 *
 * Переменные окружения (из .env или экспорта):
 *   NEXT_SERVER_ACTIONS_ENCRYPTION_KEY — обязательно для сборки и runtime
 *   DEPLOY_SERVER, DEPLOY_USER, DEPLOY_REMOTE, DEPLOY_SSH_KEY — опционально (есть дефолты)
 */
import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

// Загрузка .env из корня проекта
try {
  const envPath = join(root, ".env");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
} catch (_) {}

const SERVER = process.env.DEPLOY_SERVER || "89.125.37.62";
const USER = process.env.DEPLOY_USER || "root";
const REMOTE = process.env.DEPLOY_REMOTE || "/var/www/kaktusa";
const KEY = process.env.DEPLOY_SSH_KEY || process.env.HOME + "/.ssh/shared_server_key";
const SSH_OPTS = `-i ${KEY} -o StrictHostKeyChecking=no -o ConnectTimeout=30`;
const DATABASE_URL = `file:${REMOTE}/prisma/dev.db`;
const SERVER_ACTIONS_KEY = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY;
if (!SERVER_ACTIONS_KEY) {
  console.error("❌ NEXT_SERVER_ACTIONS_ENCRYPTION_KEY не задан. Добавьте в .env или экспортируйте.");
  process.exit(1);
}

function run(cmd) {
  return new Promise((resolve, reject) => {
    const p = spawn("sh", ["-c", cmd], { stdio: "inherit" });
    p.on("exit", (c) => (c === 0 ? resolve() : reject(new Error(`Exit ${c}`))));
  });
}

async function main() {
  const start = Date.now();
  const audit = [];
  const commitMsg = process.env.DEPLOY_COMMIT_MSG || process.argv.slice(2).join(" ") || "deploy";

  console.log("\n🔧 HARD DEPLOY (git push → npm ci, prisma, build, nginx)\n");

  let stepStart = Date.now();
  console.log("=== 0/5 Git add, commit, push (локально) ===");
  await run("git add -A");
  const hasChanges = await new Promise((resolve) => {
    const p = spawn("sh", ["-c", "git diff --staged --quiet"], { stdio: "ignore" });
    p.on("exit", (c) => resolve(c !== 0));
  });
  if (hasChanges) {
    await run(`git commit -m ${JSON.stringify(commitMsg)}`);
    await run("git push");
    console.log("   ✓ Изменения запушены");
  } else {
    console.log("   Нет изменений для коммита");
  }
  audit.push({ name: "0. Git push", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  stepStart = Date.now();
  console.log("=== 1/5 Git pull на сервере ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && cp -a prisma/dev.db /tmp/kaktusa-dev.db.bak 2>/dev/null || true && git fetch origin && git reset --hard origin/main && cp -a /tmp/kaktusa-dev.db.bak prisma/dev.db 2>/dev/null || true"`
  );
  audit.push({ name: "1. Git pull", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  stepStart = Date.now();
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
  console.log("=== 2/5 npm ci + Prisma db push + generate + Build ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && export NODE_ENV=production && export DATABASE_URL='${DATABASE_URL}' && export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY='${SERVER_ACTIONS_KEY}' && mkdir -p prisma && rm -rf node_modules && npm ci --no-audit --no-fund --include=dev && node node_modules/prisma/build/index.js db push && node node_modules/prisma/build/index.js generate && npm run db:seed && npm run build"`
  );
  audit.push({ name: "2. npm ci + db push + build", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  stepStart = Date.now();
  console.log("=== 3/5 PM2 restart ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && mkdir -p public/photos && (cp -rn .next/standalone/public/photos/. public/photos/ 2>/dev/null || true) && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && rm -rf .next/standalone/public/photos && ln -sfn ${REMOTE}/public/photos .next/standalone/public/photos && pm2 delete kaktusa 2>/dev/null; pm2 start ecosystem.config.cjs && pm2 save"`
  );
  audit.push({ name: "3. PM2 restart", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  stepStart = Date.now();
  console.log("=== 4/5 Nginx ===");
  const nginxConf = join(__dir, "nginx-tusa.conf");
  if (existsSync(nginxConf)) {
    await run(`scp ${SSH_OPTS} "${nginxConf}" ${USER}@${SERVER}:/etc/nginx/sites-available/tusa.grangy.ru`);
    await run(
      `ssh ${SSH_OPTS} ${USER}@${SERVER} "ln -sf /etc/nginx/sites-available/tusa.grangy.ru /etc/nginx/sites-enabled/ 2>/dev/null; nginx -t && systemctl reload nginx"`
    );
    audit.push({ name: "4. Nginx", s: ((Date.now() - stepStart) / 1000).toFixed(1) });
  }

  const total = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n📊 Аудит деплоя:");
  audit.forEach(({ name, s }) => console.log(`   ${name}: ${s}s`));
  console.log(`   ─────────────────`);
  console.log(`   ИТОГО: ${total}s`);
  console.log("   ℹ️  БД прода: сохранена (backup перед git pull, restore после)\n");
  console.log("💡 Для быстрого обновления: npm run deploy:light\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
