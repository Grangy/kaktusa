#!/usr/bin/env node
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dir, "..");
const dbPath = path.join(root, "prisma", "dev.db");
const url = `file:${dbPath}`;

execSync("npx tsx prisma/seed.ts", {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env, DATABASE_URL: url, USE_SQLITE: "1" },
});
