#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";

const envPath = ".env";

if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  if (content.includes("AUTH_SECRET=") && content.match(/AUTH_SECRET=.+\S/)) {
    console.log(".env already has AUTH_SECRET. OK.");
    process.exit(0);
  }
}

let env = existsSync(envPath) ? readFileSync(envPath, "utf-8") : "";

let secret = process.env.AUTH_SECRET;
if (!secret) {
  try {
    secret = execSync("openssl rand -base64 32", { encoding: "utf-8" }).trim();
  } catch {
    secret = "kaktusa-dev-secret-" + Date.now();
  }
}

function setOrAppend(content, key, value) {
  const re = new RegExp(`^${key}=.*`, "m");
  if (re.test(content)) {
    return content.replace(re, `${key}=${value}`);
  }
  return content.trimEnd() + (content.endsWith("\n") ? "" : "\n") + `\n${key}=${value}\n`;
}

env = setOrAppend(env, "AUTH_SECRET", secret);

if (!env.includes("DATABASE_URL=")) {
  env = setOrAppend(env, "DATABASE_URL", '"file:./prisma/dev.db"');
}
if (!env.includes("ADMIN_PASSWORD=") || env.match(/ADMIN_PASSWORD=\s*$/m)) {
  env = setOrAppend(env, "ADMIN_PASSWORD", "admin");
}

writeFileSync(envPath, env);
console.log("Updated .env with AUTH_SECRET, DATABASE_URL, ADMIN_PASSWORD (admin).");
console.log("Change ADMIN_PASSWORD in .env for production.");
