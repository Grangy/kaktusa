#!/usr/bin/env node
/**
 * Обновление на сервере: git pull → build → pm2 restart.
 * Без npm ci и без nginx. Запуск: node deploy/update.mjs
 * Требует DEPLOY_SERVER, DEPLOY_SSH_KEY в .env.
 */
import { spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadDeployEnv, requireDeployConfig } from "./ssh-opts.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
loadDeployEnv(root);
const { SERVER, USER, REMOTE, SSH_OPTS } = requireDeployConfig();

function run(cmd) {
  return new Promise((resolve, reject) => {
    const p = spawn("sh", ["-c", cmd], { stdio: "inherit" });
    p.on("exit", (c) => (c === 0 ? resolve() : reject(new Error(`Exit ${c}`))));
  });
}

async function main() {
  const start = Date.now();

  console.log("=== 1/3 Git pull ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && git fetch origin && git reset --hard origin/main"`
  );

  console.log("=== 2/3 Build ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && npm install --no-audit --no-fund && npm run build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/"`
  );

  console.log("=== 3/3 PM2 restart ===");
  await run(
    `ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && pm2 restart ecosystem.config.cjs && pm2 save"`
  );

  console.log(`\n✅ Update done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
