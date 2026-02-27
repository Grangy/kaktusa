#!/usr/bin/env node
/**
 * Тесты проды по SSH: доступность сайта, фото, API, PM2, nginx.
 * Запуск: node deploy/test-prod.mjs
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
if (!SERVER || !KEY) {
  console.error("❌ Задайте DEPLOY_SERVER и DEPLOY_SSH_KEY в .env.");
  process.exit(1);
}
const SSH_OPTS = `-i ${KEY} -o StrictHostKeyChecking=no -o ConnectTimeout=30`;
const SITE = process.env.DEPLOY_SITE || "https://kaktusa.ru";

function run(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn("sh", ["-c", cmd], { stdio: opts.silent ? "pipe" : "inherit", ...opts });
    let out = "";
    if (opts.silent) {
      p.stdout?.on("data", (d) => (out += d));
      p.stderr?.on("data", (d) => (out += d));
    }
    p.on("exit", (c) => (c === 0 ? resolve(out) : reject(new Error(`Exit ${c}`))));
  });
}

async function ssh(cmd) {
  return run(`ssh ${SSH_OPTS} ${USER}@${SERVER} "${cmd}"`, { silent: true });
}

async function main() {
  console.log("\n🧪 ТЕСТЫ ПРОДЫ (kaktusa.ru)\n");
  let ok = 0;
  let fail = 0;

  try {
    // 1. Главная
    const r1 = await run(`curl -s -o /dev/null -w "%{http_code}" -L "${SITE}/"`, { silent: true });
    const code1 = parseInt(r1.trim(), 10);
    if (code1 === 200) {
      console.log("✅ Главная / → 200");
      ok++;
    } else {
      console.log(`❌ Главная / → ${code1}`);
      fail++;
    }
  } catch {
    console.log("❌ Главная: запрос failed");
    fail++;
  }

  // 2. Список фото на сервере
  let photos = [];
  try {
    const list = await ssh("ls -1 /var/www/kaktusa/public/photos/ 2>/dev/null | head -5");
    photos = list.trim().split("\n").filter(Boolean);
  } catch {
    photos = [];
  }

  // 3. Один фото по HTTPS
  if (photos.length) {
    const photo = photos[0];
    try {
      const r = await run(`curl -s -o /dev/null -w "%{http_code}" -L "${SITE}/photos/${photo}"`, {
        silent: true,
      });
      const code = parseInt(r.trim(), 10);
      if (code === 200) {
        console.log(`✅ Фото /photos/${photo} → 200`);
        ok++;
      } else {
        console.log(`❌ Фото /photos/${photo} → ${code}`);
        fail++;
      }
    } catch {
      console.log(`❌ Фото /photos/${photo}: запрос failed`);
      fail++;
    }
  } else {
    console.log("⚠️  В public/photos нет файлов — загрузите тестовое фото вручную");
  }

  // 4. API upload — без авторизации должен вернуть 401
  try {
    const r = await run(
      `curl -s -o /dev/null -w "%{http_code}" -X POST "${SITE}/api/admin/upload"`,
      { silent: true }
    );
    const code = parseInt(r.trim(), 10);
    if (code === 401) {
      console.log("✅ API /api/admin/upload (без auth) → 401");
      ok++;
    } else {
      console.log(`❌ API /api/admin/upload → ${code} (ожидался 401)`);
      fail++;
    }
  } catch {
    console.log("❌ API upload: запрос failed");
    fail++;
  }

  // 5. PM2
  try {
    const pm2 = await ssh("pm2 list 2>/dev/null | grep -E 'kaktusa|online' | head -3");
    if (pm2.includes("online")) {
      console.log("✅ PM2: kaktusa online");
      ok++;
    } else {
      console.log("❌ PM2: kaktusa не online");
      fail++;
    }
  } catch {
    console.log("❌ PM2: проверка failed");
    fail++;
  }

  // 6. nginx
  try {
    await ssh("nginx -t 2>&1");
    console.log("✅ nginx -t OK");
    ok++;
  } catch {
    console.log("❌ nginx -t failed");
    fail++;
  }

  // 7. События
  try {
    const r = await run(`curl -s -o /dev/null -w "%{http_code}" -L "${SITE}/events/bloom-of-energy"`, {
      silent: true,
    });
    const code = parseInt(r.trim(), 10);
    if (code === 200) {
      console.log("✅ Страница события /events/bloom-of-energy → 200");
      ok++;
    } else {
      console.log(`❌ Событие → ${code}`);
      fail++;
    }
  } catch {
    console.log("❌ Событие: запрос failed");
    fail++;
  }

  console.log("\n─────────────────────");
  console.log(`Результат: ${ok} OK, ${fail} FAIL`);
  console.log("");
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
