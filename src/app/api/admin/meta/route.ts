import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getMeta, writeMeta } from "@/lib/data";
import type { MetaContent } from "@/types/data";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const meta = await getMeta();
    return NextResponse.json(meta);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load meta" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await req.json()) as MetaContent;
    await writeMeta(body);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/meta");
    return NextResponse.json(body);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update meta" }, { status: 500 });
  }
}
