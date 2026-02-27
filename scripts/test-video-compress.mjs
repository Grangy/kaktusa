#!/usr/bin/env node
/**
 * Тест сжатия видео: берёт один из .mp4 из public/photos,
 * прогоняет через те же параметры ffmpeg, что и при загрузке, и сравнивает размеры.
 * Запуск: node scripts/test-video-compress.mjs
 */
import { readdirSync, statSync, unlinkSync, renameSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import { promisify } from "util";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const photosDir = join(root, "public", "photos");
const execFileAsync = promisify(execFile);

function findVideo() {
  if (!existsSync(photosDir)) return null;
  const names = readdirSync(photosDir);
  const mp4 = names.find((n) => n.toLowerCase().endsWith(".mp4"));
  return mp4 ? join(photosDir, mp4) : null;
}

async function main() {
  console.log("\n🎬 Тест сжатия видео (ffmpeg, без аудио)\n");

  const inputPath = findVideo();
  if (!inputPath) {
    console.log("Нет .mp4 в public/photos. Добавьте видео и запустите снова.");
    process.exit(1);
  }

  const inputStat = statSync(inputPath);
  const inputSizeMB = (inputStat.size / 1024 / 1024).toFixed(2);
  console.log("Входной файл:", inputPath.replace(root, ""));
  console.log("Размер до:", inputSizeMB, "MB\n");

  const base = inputPath.replace(/\.[^.]+$/, "");
  const optPath = `${base}-test-opt.mp4`;
  const outputPath = `${base}-test-compressed.mp4`;

  try {
    await execFileAsync("ffmpeg", [
      "-i", inputPath,
      "-c:v", "libx264", "-crf", "28", "-preset", "medium",
      "-an", "-movflags", "+faststart", "-y", optPath,
    ], { timeout: 120_000 });

    const outStat = statSync(optPath);
    const outputSizeMB = (outStat.size / 1024 / 1024).toFixed(2);
    const ratio = ((outStat.size / inputStat.size) * 100).toFixed(0);

    console.log("Сжатый файл:", optPath.replace(root, ""));
    console.log("Размер после:", outputSizeMB, "MB");
    console.log("Соотношение:", ratio + "% от оригинала\n");

    renameSync(optPath, outputPath);
    console.log("Сохранён как:", outputPath.replace(root, ""));
    console.log("\n✅ Тест сжатия пройден.\n");
  } catch (err) {
    console.error("Ошибка ffmpeg:", err.message);
    if (existsSync(optPath)) try { unlinkSync(optPath); } catch (_) {}
    process.exit(1);
  }
}

main();
