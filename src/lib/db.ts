import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/** Корень проекта: next dev/build запускается из корня, cwd там. */
function getProjectRoot(): string {
  return process.cwd();
}

/** Путь к БД по умолчанию на продакшене (PM2, standalone). В production никогда не используем cwd — он может быть .next/standalone. */
const PRODUCTION_DB_PATH = "/var/www/kaktusa/prisma/dev.db";

/** Всегда возвращаем прямой file: URL для SQLite (абсолютный путь). Игнорируем prisma:// / Accelerate. */
function getDatabaseUrl(): string {
  const env = process.env.DATABASE_URL;
  const root = getProjectRoot();

  if (process.env.NODE_ENV === "production") {
    const prodPath = env?.startsWith("file:")
      ? env.replace(/^file:\/?/, "").replace(/\\/g, "/")
      : env && !env.includes("://")
        ? env.replace(/\\/g, "/")
        : null;
    if (prodPath && path.isAbsolute(prodPath)) return `file:${prodPath}`;
    return `file:${PRODUCTION_DB_PATH}`;
  }

  if (env && (env.startsWith("prisma://") || env.startsWith("prisma+"))) {
    // Не использовать Accelerate URL при наличии адаптера — используем fallback
  } else if (env && env.startsWith("file:")) {
    const filePath = env.replace(/^file:\/?/, "").replace(/\\/g, "/");
    const absolute = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
    return `file:${absolute.replace(/\\/g, "/")}`;
  } else if (env && !env.includes("://")) {
    const absolute = path.isAbsolute(env) ? env : path.join(root, env);
    return `file:${absolute.replace(/\\/g, "/")}`;
  }
  const fallback = path.join(root, "prisma", "dev.db").replace(/\\/g, "/");
  return `file:${fallback}`;
}

function createPrismaClient(): PrismaClient {
  const directUrl = getDatabaseUrl();
  process.env.DATABASE_URL = directUrl;
  const adapter = new PrismaBetterSqlite3({
    url: directUrl,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
