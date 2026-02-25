#!/usr/bin/env node
/**
 * Тест Prisma + SQLite: пути, подключение, запросы.
 * Запуск: node scripts/test-prisma.mjs
 * Или: cd /Users/maksim/kaktusa.ru && node scripts/test-prisma.mjs
 */
import path from "path";
import { fileURLToPath } from "url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, "..");

console.log("=== 1. Пути ===");
console.log("ROOT (project):", ROOT);
console.log("cwd:", process.cwd());

const dbRelative = "prisma/dev.db";
const dbAbsolute = path.join(ROOT, dbRelative);
console.log("DB relative:", dbRelative);
console.log("DB absolute:", dbAbsolute);

const fs = await import("fs");
const dbExists = fs.existsSync(dbAbsolute);
console.log("DB file exists:", dbExists);

console.log("\n=== 2. DATABASE_URL ===");
// load .env manually for script
try {
  const envPath = path.join(ROOT, ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const urlLine = envContent.split("\n").find((l) => l.startsWith("DATABASE_URL="));
    console.log("From .env:", urlLine ? urlLine.replace(/=.*/, "=***") : "not set");
  } else {
    console.log(".env not found");
  }
} catch (e) {
  console.log("Error reading .env:", e.message);
}

const DATABASE_URL = process.env.DATABASE_URL || `file:${dbAbsolute}`;
console.log("Using DATABASE_URL (path only):", DATABASE_URL.replace(/^file:/, ""));

console.log("\n=== 3. Prisma Client (adapter + datasources) ===");
const { PrismaClient } = await import("@prisma/client");
const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");

const dbPath = (DATABASE_URL || "").startsWith("file:")
  ? DATABASE_URL.replace(/^file:\/?/, "")
  : path.join(ROOT, "prisma", "dev.db");
const absolutePath = path.isAbsolute(dbPath) ? dbPath : path.join(ROOT, dbPath);
const directUrl = `file:${absolutePath.replace(/\\/g, "/")}`;
console.log("Direct URL:", directUrl);

const adapter = new PrismaBetterSqlite3({ url: directUrl });
const prisma = new PrismaClient({ adapter });

try {
  const events = await prisma.event.findMany({ take: 2 });
  console.log("event.findMany() OK, count:", events.length);
  const main = await prisma.main.findUnique({ where: { id: "main" } });
  console.log("main.findUnique() OK:", main ? "row exists" : "null");
  const meta = await prisma.meta.findUnique({ where: { id: "meta" } });
  console.log("meta.findUnique() OK:", meta ? "row exists" : "null");
} catch (err) {
  console.error("Query error:", err.message);
  console.error("Code:", err.code);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}

console.log("\n=== 4. Где лежит сгенерированный клиент ===");
const clientPath = path.join(ROOT, "node_modules/@prisma/client");
console.log("@prisma/client:", clientPath);
console.log("exists:", fs.existsSync(clientPath));
const defaultJs = path.join(ROOT, "node_modules/.prisma/client");
console.log(".prisma/client:", defaultJs);
console.log("exists:", fs.existsSync(defaultJs));

console.log("\n=== 5. Нет ошибки 'adapter + Accelerate' (реальный db.ts) ===");
// При DATABASE_URL=prisma://... наш getDatabaseUrl() возвращает file: — адаптер не должен видеть Accelerate.
const { spawnSync } = await import("child_process");
const res = spawnSync(
  "npx",
  ["tsx", path.join(ROOT, "scripts", "run-db-query.ts")],
  {
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL: "prisma://accelerate.prisma-data.net/fake" },
    encoding: "utf-8",
  }
);
const code = res.status;
if (code !== 0 && res.stderr) console.error(res.stderr);
if (code !== 0) {
  console.error("Ошибка: при prisma:// в env клиент не должен падать с 'adapter + Accelerate'.");
  process.exit(1);
}
console.log("При DATABASE_URL=prisma://... запрос через src/lib/db выполнен без ошибки.");

console.log("\n✅ Все тесты пройдены.");
