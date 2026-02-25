#!/usr/bin/env node
import { execSync } from "child_process";
import { rmSync, existsSync } from "fs";
import { join } from "path";

const ports = [3000, 3001];
for (const port of ports) {
  try {
    const out = execSync(`lsof -ti :${port} 2>/dev/null`, { encoding: "utf-8" });
    const pids = out.trim().split(/\s+/).filter(Boolean);
    for (const pid of pids) {
      try {
        process.kill(Number(pid), "SIGKILL");
        console.log(`Killed process ${pid} on port ${port}`);
      } catch { /* process may already be gone */ }
    }
  } catch { /* no process on port */ }
}
const lockPath = join(process.cwd(), ".next", "dev", "lock");
if (existsSync(lockPath)) {
  rmSync(lockPath);
  console.log("Removed .next/dev/lock");
}
console.log("Done. You can run npm run dev now.");
