#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dir, "..");
// Приложение (db.ts) подключается к SQLite prisma/dev.db. Пушим схему в ту же БД.
process.env.DATABASE_URL = `file:${path.join(root, "prisma", "dev.db")}`;
const { execSync } = await import("child_process");
execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", cwd: root });
