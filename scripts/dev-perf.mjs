#!/usr/bin/env node
/**
 * Запуск dev-сервера и замер времени ответа основных страниц.
 * Сначала запустите в другом терминале: npm run dev
 * Затем: node scripts/dev-perf.mjs
 * Или запуск с авто-стартом dev (если порт 3000 свободен): node scripts/dev-perf.mjs --start-dev
 */
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");

const PAGES = [
  { name: "Главная", path: "/" },
  { name: "BLOOM OF ENERGY", path: "/events/bloom-of-energy" },
  { name: "Тот самый бал", path: "/events/tot-samyj-bal" },
];

const BASE = "http://localhost:3000";
const startDev = process.argv.includes("--start-dev");

function run(cmd) {
  return new Promise((resolve, reject) => {
    const p = spawn("sh", ["-c", cmd], { cwd: ROOT, stdio: "pipe" });
    let out = "";
    p.stdout?.on("data", (d) => (out += d.toString()));
    p.stderr?.on("data", (d) => (out += d.toString()));
    p.on("exit", (c) => (c === 0 ? resolve(out) : reject(new Error(out || `Exit ${c}`))));
  });
}

async function fetchTime(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { redirect: "follow" });
    const body = await res.text();
    const ms = Date.now() - start;
    return { ok: res.ok, status: res.status, ms, size: body.length };
  } catch (e) {
    return { ok: false, error: e.message, ms: Date.now() - start };
  }
}

async function main() {
  if (startDev) {
    console.log("Запуск dev-сервера (npm run dev)...");
    const dev = spawn("npm", ["run", "dev"], { cwd: ROOT, stdio: "inherit" });
    await new Promise((r) => setTimeout(r, 8000));
    console.log("");
  }

  console.log("Замер времени ответа (dev):\n");
  for (const { name, path } of PAGES) {
    const url = BASE + path;
    const r = await fetchTime(url);
    if (r.error) {
      console.log(`  ${name}: ошибка — ${r.error}`);
    } else {
      const status = r.ok ? "OK" : r.status;
      console.log(`  ${name}: ${r.ms} ms, ${status}, ${(r.size / 1024).toFixed(1)} KB`);
    }
  }
  console.log("\nГотово. Проверьте в браузере: " + BASE);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
