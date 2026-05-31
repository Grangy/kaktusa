#!/usr/bin/env node
/**
 * Экспорт заказов билетов в .xlsx: билет + признак успешной оплаты.
 *
 * Запуск из корня репозитория:
 *   node scripts/export-tickets-xlsx.mjs
 *   node scripts/export-tickets-xlsx.mjs --out ./exports/my.xlsx
 *   node scripts/export-tickets-xlsx.mjs --days 30   # только заказы с createdAt за последние N дней
 *
 * DATABASE_URL берётся из .env (например file:./prisma/dev.db).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

function loadEnv() {
  try {
    const envPath = join(root, ".env");
    if (!existsSync(envPath)) return;
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
}

function parseArgs() {
  const argv = process.argv.slice(2);
  let out = null;
  let days = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out" && argv[i + 1]) {
      out = argv[++i];
    } else if (argv[i] === "--days" && argv[i + 1]) {
      days = Math.max(1, parseInt(argv[++i], 10) || 0);
    } else if (argv[i] === "--help" || argv[i] === "-h") {
      console.log(`Usage: node scripts/export-tickets-xlsx.mjs [--out path.xlsx] [--days N]`);
      process.exit(0);
    }
  }
  const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(/:/g, "");
  const defaultOut = join(root, "exports", `tickets-${stamp}.xlsx`);
  return { out: out || defaultOut, days };
}

function yesNo(ok) {
  return ok ? "Да" : "Нет";
}

async function main() {
  loadEnv();
  const { out, days } = parseArgs();

  if (!process.env.DATABASE_URL) {
    console.error("❌ Задайте DATABASE_URL в .env (например file:./prisma/dev.db).");
    process.exit(1);
  }
  const du = process.env.DATABASE_URL;
  if (du.startsWith("prisma://") || du.startsWith("prisma+")) {
    console.error("❌ Для этого скрипта нужен прямой SQLite, например:");
    console.error('   DATABASE_URL="file:./prisma/dev.db" npm run export:tickets-xlsx');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const since =
      days != null
        ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        : null;

    const where = since ? { createdAt: { gte: since } } : {};

    const orders = await prisma.ticketOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const slugs = [...new Set(orders.map((o) => o.eventSlug))];
    const events = await prisma.event.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, title: true, dateDisplay: true, time: true },
    });
    const evMap = Object.fromEntries(events.map((e) => [e.slug, e]));

    const site =
      (process.env.AUTH_URL && String(process.env.AUTH_URL).replace(/\/$/, "")) || "https://kaktusa.ru";

    const rows = orders.map((o) => {
      const ev = evMap[o.eventSlug];
      const ticketUrl = o.qrToken ? `${site}/ticket/${encodeURIComponent(o.qrToken)}` : "";
      const succeeded = o.status === "succeeded";
      return {
        "ID заказа": o.id,
        "Мероприятие (slug)": o.eventSlug,
        "Название мероприятия": ev?.title ?? "",
        "Дата мероприятия": ev?.dateDisplay ?? "",
        "Время мероприятия": ev?.time ?? "",
        "Номер билета": o.ticketNumber ?? "",
        "Ссылка на билет": ticketUrl,
        "Тариф": o.ticketName ?? o.ticketId ?? "",
        Email: o.email,
        Телефон: o.phone ?? "",
        Сумма: o.amountValue,
        Валюта: o.currency,
        "Способ оплаты": o.method ?? "",
        "ID платежа (ЮKassa)": o.paymentId ?? "",
        "Статус заказа": o.status,
        "Оплата успешна": yesNo(succeeded),
        "Создан (UTC)": o.createdAt.toISOString(),
        "Обновлён (UTC)": o.updatedAt.toISOString(),
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Билеты");

    const dir = dirname(out);
    if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
    XLSX.writeFile(wb, out);

    console.log(`✅ Экспортировано строк: ${rows.length}`);
    console.log(`   Файл: ${out}`);
    if (days) console.log(`   Фильтр: createdAt за последние ${days} дн.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
