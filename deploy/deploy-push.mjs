#!/usr/bin/env node
/**
 * Git push + light deploy. Перед деплоем: git add, commit, push.
 * Использование: npm run deploy:go
 * Сообщение коммита: deploy:go "сообщение" или по умолчанию "deploy"
 */
import { spawn } from "child_process";

const msg = process.argv.slice(2).join(" ") || "deploy";

function run(cmd) {
  return new Promise((resolve, reject) => {
    const p = spawn("sh", ["-c", cmd], { stdio: "inherit" });
    p.on("exit", (c) => (c === 0 ? resolve() : reject(new Error(`Exit ${c}`))));
  });
}

async function main() {
  console.log("\n📤 Git add, commit, push → deploy:light\n");
  await run("git add -A");
  const status = await new Promise((resolve) => {
    const p = spawn("sh", ["-c", "git diff --staged --quiet"], { stdio: "ignore" });
    p.on("exit", (c) => resolve(c));
  });
  if (status !== 0) {
    await run(`git commit -m ${JSON.stringify(msg)}`);
    await run("git push");
  } else {
    console.log("Нет изменений для коммита.");
  }
  await run("npm run deploy:light");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
