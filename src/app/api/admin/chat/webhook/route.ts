import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getChatSettings } from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kaktusa.ru";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const settings = await getChatSettings();
    const token = settings.botToken?.trim();
    if (!token) {
      return NextResponse.json({ error: "Сначала укажите токен бота" }, { status: 400 });
    }
    const webhookUrl = `${SITE_URL.replace(/\/$/, "")}/api/telegram/webhook`;
    const r = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
    );
    const data = (await r.json()) as { ok?: boolean; description?: string };
    if (!data.ok) {
      return NextResponse.json(
        { error: data.description || "Ошибка установки webhook" },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, url: webhookUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка установки webhook" }, { status: 500 });
  }
}
