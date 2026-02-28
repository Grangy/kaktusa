import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { updateEventsOrder } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await req.json()) as { slugs?: string[] };
    const slugs = body.slugs;
    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ error: "slugs[] required" }, { status: 400 });
    }
    await updateEventsOrder(slugs);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/events");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
