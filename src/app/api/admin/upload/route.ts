import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const UPLOAD_DIR = "photos"; // under public

/** Всегда пишем в project root / public / photos — постоянное хранилище. Deploy делает symlink в standalone. */
function getUploadDir(): string {
  return path.join(process.cwd(), "public", UPLOAD_DIR);
}

function safeName(original: string): string {
  const ext = path.extname(original).toLowerCase() || ".jpg";
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
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Disallowed type: ${file.type}. Use JPEG, PNG, WebP or GIF.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 10 MB` },
          { status: 400 }
        );
      }
      const name = safeName(file.name);
      const filePath = path.join(dir, name);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      paths.push(`/${UPLOAD_DIR}/${name}`);
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
