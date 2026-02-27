#!/usr/bin/env node
/**
 * Аудит размеров фото в public/photos (для галереи).
 * Запуск: node scripts/audit-photos.mjs
 */
import { readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const PHOTOS_DIR = join(__dir, "..", "public", "photos");

const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function walk(dir, list = []) {
  try {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(full, list);
      else if (EXTS.has(extname(name).toLowerCase())) list.push({ path: full, size: st.size });
    }
  } catch {}
  return list;
}

const files = walk(PHOTOS_DIR);
const total = files.reduce((s, f) => s + f.size, 0);
const over500 = files.filter((f) => f.size > 500 * 1024);
const over1m = files.filter((f) => f.size > 1024 * 1024);

console.log("\n📷 Аудит фото (public/photos)\n");
console.log("Файлов:", files.length);
console.log("Всего МБ:", (total / 1024 / 1024).toFixed(2));
console.log("> 500 KB:", over500.length);
console.log("> 1 MB:", over1m.length);
if (files.length) console.log("Средний размер KB:", Math.round((total / files.length) / 1024));
console.log("\nAPI /api/photos/*?w=... отдаёт ресайз через sharp (webp).");
console.log("Карусель галереи: priority только для первых 2 фото, остальные lazy.");
console.log("\nПрод: loader для локальных путей (/, /avisha/, /new-logo.png) отдаёт URL как есть,");
console.log("т.к. standalone не поддерживает /_next/image → иначе 404.\n");
