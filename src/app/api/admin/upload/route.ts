import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir, unlink, rename } from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 150 * 1024 * 1024; // 150 MB
const UPLOAD_DIR = "photos"; // under public (фото и видео)

/** Всегда пишем в project root / public / photos — постоянное хранилище. Deploy делает symlink в standalone. */
function getUploadDir(): string {
  return path.join(process.cwd(), "public", UPLOAD_DIR);
}

/**
 * Сжатие видео через ffmpeg: H.264, CRF 28, без аудио, faststart для веба.
 * Если ffmpeg недоступен или ошибка — возвращаем исходный путь.
 */
async function optimizeVideo(inputPath: string, dir: string, baseName: string): Promise<{ path: string }> {
  const optPath = path.join(dir, `${baseName}-opt.mp4`);
  const finalPath = path.join(dir, `${baseName}.mp4`);
  try {
    // H.264, без аудио (hero всегда muted)
    await execFileAsync("ffmpeg", [
      "-i", inputPath,
      "-c:v", "libx264", "-crf", "28", "-preset", "medium",
      "-an", "-movflags", "+faststart", "-y", optPath,
    ], { timeout: 300_000 });
    await unlink(inputPath);
    await rename(optPath, finalPath);
    return { path: `/${UPLOAD_DIR}/${baseName}.mp4` };
  } catch (err) {
    console.warn("Video optimize failed, keeping original:", err);
    return { path: `/${UPLOAD_DIR}/${path.basename(inputPath)}` };
  }
}

function safeName(original: string, mime: string): string {
  let ext = path.extname(original).toLowerCase();
  if (!ext || !/^\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|avi)$/i.test(ext)) {
    ext = mime.startsWith("video/") ? ".mp4" : ".jpg";
  }
  let base = path.basename(original, path.extname(original))
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
  if (!base || /^_+$/.test(base)) base = "image";
  const stamp = Date.now().toString(36);
  return `${base}-${stamp}${ext}`;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const single = formData.get("file") as File | null;
    const list: File[] = single ? [single] : files;
    if (!list.length) {
      return NextResponse.json(
        { error: "No file(s) sent. Use field 'file' or 'files'" },
        { status: 400 }
      );
    }

    const dir = getUploadDir();
    await mkdir(dir, { recursive: true });

    const paths: string[] = [];
    for (const file of list) {
      if (!file?.size || !file?.name) continue;
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      if (!isImage && !isVideo) {
        return NextResponse.json(
          { error: `Неверный тип: ${file.type}. Разрешены: изображения (JPEG, PNG, WebP, GIF) и видео (MP4, WebM, MOV, AVI).` },
          { status: 400 }
        );
      }
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `Файл ${file.name} превышает лимит (${isVideo ? "150 MB" : "10 MB"}).` },
          { status: 400 }
        );
      }
      const name = safeName(file.name, file.type);
      const filePath = path.join(dir, name);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      if (isVideo) {
        const baseName = path.basename(name, path.extname(name));
        const { path: videoPath } = await optimizeVideo(filePath, dir, baseName);
        paths.push(videoPath);
      } else {
        paths.push(`/${UPLOAD_DIR}/${name}`);
      }
    }

    if (!paths.length) {
      return NextResponse.json(
        { error: "No valid files to save" },
        { status: 400 }
      );
    }

    return NextResponse.json({ paths, ok: true });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
