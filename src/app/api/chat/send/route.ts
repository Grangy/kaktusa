import { NextResponse } from "next/server";
import {
  getChatSettings,
  isChatWithinWorkingHours,
  createChatMessage,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string; sessionId?: string };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";

    if (!text || !sessionId) {
      return NextResponse.json(
        { error: "Требуются text и sessionId" },
        { status: 400 }
      );
    }

    const settings = await getChatSettings();
    if (!settings.enabled) {
      return NextResponse.json(
        { error: "Чат временно недоступен" },
        { status: 503 }
      );
    }

    const withinHours = isChatWithinWorkingHours(settings.workStartMsk, settings.workEndMsk);
    if (!withinHours) {
      return NextResponse.json(
        { error: "Чат доступен в рабочие часы (МСК)" },
        { status: 503 }
      );
    }

    const msg = await createChatMessage({
      sessionId,
      text,
      fromAdmin: false,
    });

    const token = settings.botToken?.trim();
    const chatId = settings.telegramChatId?.trim();
    if (token && chatId) {
      try {
        const escape = (s: string) =>
          s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const replyMarkup = {
          inline_keyboard: [
            [{ text: "Ответить", callback_data: `reply:${sessionId}` }],
          ],
        };
        // chat_id как строка — корректно для групп (например -5135295224)
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `💬 Сообщение из чата на сайте (сессия ${escape(sessionId.slice(0, 8))}…):\n\n${escape(text)}`,
            parse_mode: "HTML",
            reply_markup: replyMarkup,
          }),
        });
      } catch (telErr) {
        console.error("Telegram send error:", telErr);
      }
    }

    return NextResponse.json({ id: msg.id, createdAt: msg.createdAt });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка отправки" }, { status: 500 });
  }
}
