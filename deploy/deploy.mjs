#!/usr/bin/env node
/**
 * Деплой: всегда билд → выгрузка (rsync только изменённые файлы) → перезапуск PM2 → nginx.
 * Запуск: node deploy/deploy.mjs   (билд выполняется всегда, без --no-build)
 */
import { spawn } from "child_process";
import { copyFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const SERVER = "89.125.37.62";
const USER = "root";
const KEY = process.env.HOME + "/.ssh/shared_server_key";
const REMOTE = "/var/www/kaktusa";
const STANDALONE = join(ROOT, ".next/standalone/kaktusa.ru");
const SSH_OPTS = `-i ${KEY} -o StrictHostKeyChecking=no -o ConnectTimeout=30`;

function exec(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    const [bin, ...args] = cmd.split(/\s+/);
    const p = spawn(bin, args, { stdio: "inherit", shell: true, ...opts });
    p.on("exit", (c) => (c === 0 ? resolve() : reject(new Error(`Exit ${c}`))));
  });
}

function run(cmd) {
  return new Promise((resolve, reject) => {
    const p = spawn("sh", ["-c", cmd], { stdio: "inherit" });
    p.on("exit", (c) => (c === 0 ? resolve() : reject(new Error(`Exit ${c}`))));
  });
}

async function main() {
  const start = Date.now();

  console.log("=== 1/5 Build ===");
  await exec("npm run build", { cwd: ROOT });

  if (!existsSync(STANDALONE)) {
    throw new Error("Standalone build not found");
  }

  console.log("=== 2/5 Prepare ===");
  copyFileSync(join(ROOT, "ecosystem.config.cjs"), join(STANDALONE, "ecosystem.config.cjs"));

  console.log("=== 3/5 Upload (rsync: только изменённые файлы) ===");
  const rsyncOpts = "-az --delete";
  const rsync = (src, dest, extra = "") =>
    run(`rsync ${rsyncOpts} ${extra} -e "ssh ${SSH_OPTS}" "${src}" ${USER}@${SERVER}:${dest}`);

  await run(`ssh ${SSH_OPTS} ${USER}@${SERVER} "mkdir -p ${REMOTE} ${REMOTE}/.next"`);

  const standaloneDir = STANDALONE.endsWith("/") ? STANDALONE : STANDALONE + "/";
  const remoteDir = REMOTE.endsWith("/") ? REMOTE : REMOTE + "/";
  await rsync(standaloneDir, remoteDir);
  await rsync(join(ROOT, ".next/static/"), `${REMOTE}/.next/static/`);
  await rsync(join(ROOT, "public/"), `${REMOTE}/public/`, "--progress");

  console.log("=== 4/5 Restart ===");
  await run(`ssh ${SSH_OPTS} ${USER}@${SERVER} "cd ${REMOTE} && npm install sharp --omit=dev --no-audit --no-fund 2>/dev/null; pm2 restart ecosystem.config.cjs 2>/dev/null || pm2 start ecosystem.config.cjs; pm2 save"`);

  console.log("=== 5/5 Nginx (kaktusa.ru) ===");
  const nginxConf = join(__dir, "nginx-tusa.conf");
  if (existsSync(nginxConf)) {
    await run(`scp ${SSH_OPTS} "${nginxConf}" ${USER}@${SERVER}:/etc/nginx/sites-available/tusa.grangy.ru`);
    await run(`ssh ${SSH_OPTS} ${USER}@${SERVER} "ln -sf /etc/nginx/sites-available/tusa.grangy.ru /etc/nginx/sites-enabled/ 2>/dev/null; nginx -t && systemctl reload nginx"`);
  }

  console.log(`\n✅ Deploy done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
