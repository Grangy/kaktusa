import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getEvents, createEvent } from "@/lib/data";
import type { Event } from "@/types/data";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const events = await getEvents();
    return NextResponse.json(events);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await req.json()) as Event;
    const events = await getEvents();
    if (events.some((e) => e.slug === body.slug)) {
      return NextResponse.json({ error: "Event with this slug already exists" }, { status: 400 });
    }
    await createEvent(body);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/events");
    return NextResponse.json(body);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
