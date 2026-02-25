#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dir, "..");
// Приложение (db.ts) подключается к SQLite prisma/dev.db. Пушим схему в ту же БД.
process.env.USE_SQLITE = "1";
const { execSync } = await import("child_process");
execSync("npx prisma db push", { stdio: "inherit", cwd: root });
