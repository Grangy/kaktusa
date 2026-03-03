import { NextResponse } from "next/server";
import { getChatMessagesBySession } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId")?.trim();
    if (!sessionId) {
      return NextResponse.json(
        { error: "Требуется sessionId" },
        { status: 400 }
      );
    }

    const messages = await getChatMessagesBySession(sessionId);
    return NextResponse.json(
      messages.map((m) => ({
        id: m.id,
        text: m.text,
        fromAdmin: m.fromAdmin,
        createdAt: m.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}
