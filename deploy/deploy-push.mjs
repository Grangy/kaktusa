#!/usr/bin/env node
/**
 * deploy:go — алиас deploy:light (push уже встроен).
 * Сообщение коммита: npm run deploy:go "сообщение"
 */
import { spawn } from "child_process";

const args = process.argv.slice(2);
const cmd = args.length ? `node deploy/deploy-light.mjs ${args.map((a) => JSON.stringify(a)).join(" ")}` : "npm run deploy:light";

spawn("sh", ["-c", cmd], { stdio: "inherit" }).on("exit", (c) => process.exit(c ?? 0));
