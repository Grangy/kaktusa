import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathSegments } = await params;
  if (!pathSegments?.length) {
    return NextResponse.json({ error: "Path required" }, { status: 400 });
  }

  // Безопасность: запрет path traversal (../)
  const fileName = pathSegments[pathSegments.length - 1];
  if (fileName.includes("..") || pathSegments.some((p) => p.includes(".."))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.join(PHOTOS_DIR, ...pathSegments);
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
