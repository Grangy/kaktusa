import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getMain, writeMain } from "@/lib/data";
import type { MainContent } from "@/types/data";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const main = await getMain();
    return NextResponse.json(main);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load main content" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await req.json()) as MainContent;
    await writeMain(body);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/main");
    return NextResponse.json(body);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update main content" }, { status: 500 });
  }
}
