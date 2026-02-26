#!/usr/bin/env node
/**
 * Запускается на СЕРВЕРЕ через SSH.
 * Аудит: события в БД vs data/events.json.
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function run() {
  const prod = await prisma.event.findMany({
    select: { slug: true, title: true },
    orderBy: { date: "desc" },
  });
  const eventsPath = path.join(process.cwd(), "data", "events.json");
  const events = JSON.parse(fs.readFileSync(eventsPath, "utf-8"));
  const slugs = new Set(events.map((e) => e.slug));
  const prodSlugs = new Set(prod.map((e) => e.slug));
  const missing = events.filter((e) => !prodSlugs.has(e.slug));
  const extra = prod.filter((e) => !slugs.has(e.slug));

  console.log("=== АУДИТ МЕРОПРИЯТИЙ НА ПРОДЕ ===");
  console.log("В data/events.json:", events.length, "| В БД прод:", prod.length);
  console.log("");
  console.log("На проде:", prod.map((e) => e.slug + " — " + e.title).join(" | ") || "(пусто)");
  console.log("");
  if (missing.length) {
    console.log("НЕТ НА ПРОДЕ (будут добавлены через seed):", missing.map((e) => e.slug).join(", "));
  } else {
    console.log("Все мероприятия из events.json уже на проде.");
  }
  if (extra.length) {
    console.log("Только на проде (не в events.json):", extra.map((e) => e.slug).join(", "));
  }
  await prisma.$disconnect();
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
