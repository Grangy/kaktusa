import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getEvents } from "@/lib/data";

/**
 * POST /api/admin/revalidate
 * Принудительно сбрасывает кэш страниц сайта после изменений в админке.
 * Вызывается автоматически после сохранения или вручную по кнопке «Очистить кэш».
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin");
    revalidatePath("/admin/events");
    revalidatePath("/admin/main");
    revalidatePath("/admin/meta");

    const events = await getEvents();
    for (const event of events) {
      revalidatePath(`/events/${event.slug}`);
    }

    return NextResponse.json({
      ok: true,
      revalidated: ["/", "/admin", "/admin/events", "/admin/main", "/admin/meta", ...events.map((e) => `/events/${e.slug}`)],
    });
  } catch (e) {
    console.error("Revalidate error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Revalidate failed" },
      { status: 500 }
    );
  }
}
