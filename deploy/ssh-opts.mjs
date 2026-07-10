import { existsSync, readFileSync } from "fs";
import { join } from "path";

export function loadDeployEnv(root) {
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

export function getDeployConfig() {
  const SERVER = process.env.DEPLOY_SERVER;
  const USER = process.env.DEPLOY_USER || "root";
  const REMOTE = process.env.DEPLOY_REMOTE || "/var/www/kaktusa";
  const KEY = process.env.DEPLOY_SSH_KEY;
  const PORT = process.env.DEPLOY_PORT;
  const portOpt = PORT ? `-p ${PORT}` : "";
  const SSH_OPTS = `-i ${KEY} ${portOpt} -o StrictHostKeyChecking=no -o ConnectTimeout=30`.trim();
  return { SERVER, USER, REMOTE, KEY, SSH_OPTS };
}

export function requireDeployConfig() {
  const cfg = getDeployConfig();
  if (!cfg.SERVER || !cfg.KEY) {
    console.error("❌ Задайте DEPLOY_SERVER и DEPLOY_SSH_KEY в .env (см. .env.example).");
    process.exit(1);
  }
  return cfg;
}
