import { NextResponse } from "next/server";
import {
  getChatSettings,
  createChatMessage,
  getChatReplyState,
  setChatReplyState,
  deleteChatReplyState,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface TelegramUpdate {
  update_id?: number;
  message?: {
    message_id: number;
    from?: { id: number; username?: string };
    chat: { id: number };
    text?: string;
  };
  callback_query?: {
    id: string;
    from: { id: number };
    message?: { message_id: number; chat: { id: number } };
    data?: string;
  };
}

export async function POST(req: Request) {
  let body: TelegramUpdate;
  try {
    body = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const settings = await getChatSettings().catch(() => null);
  const token = settings?.botToken?.trim();
  if (!token) {
    return NextResponse.json({ ok: true });
  }

  const answerCallback = (callbackId: string, text: string) =>
    fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackId, text }),
    }).catch(() => {});

  const sendMessage = (chatId: number | string, text: string) =>
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    }).catch(() => {});

  // Нажатие инлайн-кнопки «Ответить»
  if (body.callback_query) {
    const cq = body.callback_query;
    const data = cq.data ?? "";
    const telegramUserId = String(cq.from.id);

    if (data.startsWith("reply:")) {
      const sessionId = data.slice(6).trim();
      if (sessionId) {
        await setChatReplyState(telegramUserId, sessionId);
        await answerCallback(cq.id, "Ожидаю ваш ответ");
        await sendMessage(cq.from.id, "Напишите ответ. Он будет отправлен в чат на сайте.");
      }
    }
    return NextResponse.json({ ok: true });
  }

  // Текстовое сообщение от пользователя (возможный ответ в чат)
  if (body.message?.text) {
    const fromId = body.message.from?.id;
    const chatId = body.message.chat.id;
    const text = body.message.text.trim();
    if (!fromId || !text) return NextResponse.json({ ok: true });

    const telegramUserId = String(fromId);
    const state = await getChatReplyState(telegramUserId);

    if (state) {
      await createChatMessage({
        sessionId: state.sessionId,
        text,
        fromAdmin: true,
      });
      await deleteChatReplyState(telegramUserId);
      await sendMessage(chatId, "Ответ отправлен в чат на сайте.");
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
