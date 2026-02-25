import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getEventBySlug, updateEvent, deleteEvent } from "@/lib/data";
import type { Event } from "@/types/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { slug } = await params;
    const event = await getEventBySlug(slug);
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(event);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load event" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { slug } = await params;
    const body = (await req.json()) as Event;
    const existing = await getEventBySlug(slug);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await updateEvent(slug, { ...body, slug });
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/events");
    revalidatePath(`/events/${slug}`);
    return NextResponse.json({ ...body, slug });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { slug } = await params;
    const existing = await getEventBySlug(slug);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await deleteEvent(slug);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/events");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
