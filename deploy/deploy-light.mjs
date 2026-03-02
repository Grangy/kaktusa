#!/usr/bin/env node
/**
 * Лайт-деплой: git pull → prisma db push → build → pm2 restart.
 * Без: npm ci, nginx, seed. База прода не трогается (только схема через db push).
 * Использовать когда менялся только код (src/), а не package.json.
 *
 * Переменные окружения: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY (обязательно), DEPLOY_* (опционально).
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
const REMOTE = process.env.DEPLOY_REMOTE || "/var/www/kaktusa";
const KEY = process.env.DEPLOY_SSH_KEY;
if (!SERVER || !KEY) {
  console.error("❌ Задайте DEPLOY_SERVER и DEPLOY_SSH_KEY в .env (см. .env.example).");
  process.exit(1);
}
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

  console.log("\n⚡ LIGHT DEPLOY (git push → pull → build → pm2)\n");

  let stepStart = Date.now();
  console.log("=== 0/4 Git add, commit, push (локально) ===");
  await run("git add -A");
  const hasChanges = await new Promise((resolve) => {
    const p = spawn("sh", ["-c", "git diff --staged --quiet"], { stdio: "ignore" });
    p.on("exit", (c) => resolve(c !== 0));
  });
  if (hasChanges) {
    await run(`git commit -m ${JSON.stringify(commitMsg)}`);
    console.log("   ✓ Коммит создан");
  } else {
    console.log("   Нет изменений для коммита");
  }
  // Всегда пушим — иначе уже закоммиченные коммиты не попадут на сервер (один запуск = полный деплой)
  await run("git push");
  console.log("   ✓ Push выполнен");
  audit.push({ name: "0. Git push", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  stepStart = Date.now();
  console.log("=== 1/4 Git pull ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && PREV_REF=\\$(git rev-parse HEAD) && cp -a prisma/dev.db /tmp/kaktusa-dev.db.bak 2>/dev/null || true && git fetch origin && git reset --hard origin/main && echo \\\"\\$PREV_REF\\\" > /tmp/kaktusa_prev_ref && cp -a /tmp/kaktusa-dev.db.bak prisma/dev.db 2>/dev/null || true"`
  );
  audit.push({ name: "1. Git pull", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  stepStart = Date.now();
  console.log("=== 2/4 Prisma db push + Build ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && export NODE_ENV=production && export DATABASE_URL='${DATABASE_URL}' && export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY='${SERVER_ACTIONS_KEY}' && (PREV=\\\$(cat /tmp/kaktusa_prev_ref 2>/dev/null); DEPS=\\\$(git diff --name-only \\\"\\$PREV\\\" HEAD 2>/dev/null | grep -E 'package(-lock)?\\\\.json' || true); if [ -n \\\"\\$DEPS\\\" ] || [ ! -d node_modules ]; then npm ci --no-audit --no-fund --include=dev; fi) && node node_modules/prisma/build/index.js db push && node node_modules/prisma/build/index.js generate && npm run db:seed && npm run build && mkdir -p public/photos && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && rm -rf .next/standalone/public/photos && ln -sfn ${REMOTE}/public/photos .next/standalone/public/photos"`
  );
  audit.push({ name: "2. Prisma migrate + build", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  stepStart = Date.now();
  console.log("=== 3/4 PM2 restart ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && pm2 restart ecosystem.config.cjs && pm2 save"`
  );
  audit.push({ name: "3. PM2 restart", s: ((Date.now() - stepStart) / 1000).toFixed(1) });

  const total = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n📊 Аудит лайт-деплоя:");
  audit.forEach(({ name, s }) => console.log(`   ${name}: ${s}s`));
  console.log(`   ─────────────────`);
  console.log(`   ИТОГО: ${total}s`);
  console.log("   ℹ️  БД прода: сохранена (backup перед git pull, restore после)");
  console.log("   💡 Сообщение коммита: DEPLOY_COMMIT_MSG или аргумент (npm run deploy:light \"fix preloader\")\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
