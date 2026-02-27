import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

const MAX_WIDTH = 1920;
const DEFAULT_QUALITY = 80;

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathSegments } = await params;
  const filtered = pathSegments?.filter((p) => p?.trim()) ?? [];
  if (!filtered.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fileName = filtered[filtered.length - 1];
  if (fileName.includes("..") || filtered.some((p) => p.includes(".."))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.join(PHOTOS_DIR, ...filtered);
  if (!filePath.startsWith(PHOTOS_DIR)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ext = path.extname(fileName).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";

    const url = new URL(request.url);
    const widthParam = url.searchParams.get("w");
    const qualityParam = url.searchParams.get("q");
    const width = widthParam ? Math.min(parseInt(widthParam, 10) || 0, MAX_WIDTH) : 0;
    const quality = qualityParam ? Math.min(100, Math.max(1, parseInt(qualityParam, 10) || DEFAULT_QUALITY)) : DEFAULT_QUALITY;

    if (width > 0 && [".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      const buffer = fs.readFileSync(filePath);
      const resized = await sharp(buffer)
        .resize(width, undefined, { withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
      return new NextResponse(new Uint8Array(resized), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const buffer = fs.readFileSync(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
