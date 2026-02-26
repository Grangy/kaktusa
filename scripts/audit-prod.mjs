#!/usr/bin/env node
/**
 * Аудит мероприятий на проде: что есть в БД vs data/events.json.
 * Добавляет недостающие мероприятия (только create, никогда не перезаписывает).
 * Запуск: node scripts/audit-prod.mjs
 */
import { execSync } from "child_process";
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
} catch (_) {}

const SERVER = process.env.DEPLOY_SERVER || "89.125.37.62";
const USER = process.env.DEPLOY_USER || "root";
const REMOTE = process.env.DEPLOY_REMOTE || "/var/www/kaktusa";
const KEY = process.env.DEPLOY_SSH_KEY || process.env.HOME + "/.ssh/shared_server_key";
const SSH_OPTS = `-i ${KEY} -o StrictHostKeyChecking=no -o ConnectTimeout=30`;

console.log("\n📋 Аудит БД на проде...\n");
execSync(
  `scp ${SSH_OPTS} "${join(root, "scripts/audit-prod-remote.mjs")}" ${USER}@${SERVER}:${REMOTE}/`,
  { stdio: "inherit" }
);
execSync(
  `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && export NODE_ENV=production && export DATABASE_URL='file:${REMOTE}/prisma/dev.db' && node audit-prod-remote.mjs"`,
  { stdio: "inherit" }
);

console.log("\n🔄 Запуск seed (добавит недостающие)...\n");
execSync(
  `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && export NODE_ENV=production && export DATABASE_URL='file:${REMOTE}/prisma/dev.db' && npm run db:seed"`,
  { stdio: "inherit" }
);

console.log("\n✅ Готово.\n");
