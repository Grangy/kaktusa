import { NextResponse } from "next/server";
import {
  getChatSettings,
  createChatMessage,
  getChatMessagesBySession,
  getChatReplyState,
  setChatReplyState,
  deleteChatReplyState,
  createLeadPhone,
  hasLeadPhone,
  extractPhonesFromText,
  stripPhoneTags,
} from "@/lib/data";
import { askGemini, getGeminiKeysFromSettings, type GeminiMessage } from "@/lib/gemini";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_HISTORY = 10;

function buildChatPrompt(basePrompt: string | null | undefined): string {
  const base = basePrompt?.trim() || "Ты помощник на сайте мероприятия. Отвечай кратко и по делу.";
  const phoneInstruction = `

[ВАЖНО про номера] Добавляй строку [PHONE:...] только если в ЭТОМ сообщении собеседник сам написал свой реальный номер телефона. Тогда в конце ответа добавь с новой строки ровно одну строку [PHONE:+79001234567] в E.164. Никогда не придумывай номер.`;
  return base + phoneInstruction;
}

async function sendPhoneToTelegram(token: string, chatId: string, phone: string, sessionId: string): Promise<void> {
  const msg = `📱 Номер из чата: ${phone}\nСессия: ${sessionId.slice(0, 12)}…`;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: msg }),
  }).catch(() => {});
}

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

  // Нажатие инлайн-кнопки «Ответить» (работает и в личке, и в группе)
  if (body.callback_query) {
    const cq = body.callback_query;
    const data = cq.data ?? "";
    const telegramUserId = String(cq.from.id);

    if (data.startsWith("reply:")) {
      const sessionId = data.slice(6).trim();
      if (sessionId) {
        await setChatReplyState(telegramUserId, sessionId);
        await answerCallback(cq.id, "Ожидаю ваш ответ");
        // В группе шлём в группу, чтобы ответ писали там; в личке — пользователю
        const targetChatId = cq.message?.chat?.id ?? cq.from.id;
        const replyToMsgId = cq.message?.message_id;
        const text = "Напишите ответ — он будет отправлен в чат на сайте.";
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: targetChatId,
            text,
            parse_mode: "HTML",
            ...(replyToMsgId ? { reply_to_message_id: replyToMsgId } : {}),
          }),
        }).catch(() => {});
      }
    }
    return NextResponse.json({ ok: true });
  }

  // Текстовое сообщение: либо ответ в чат сайта, либо запрос к ИИ-боту
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
      return NextResponse.json({ ok: true });
    }

    // Режим ИИ: отвечаем тем же ботом (тот же промпт) при письме в ТГ
    if (settings?.chatMode === "gemini") {
      const keys = getGeminiKeysFromSettings(settings.geminiApiKeys);
      const prompt = buildChatPrompt(settings.geminiPrompt);
      if (keys.length > 0) {
        const sessionId = `tg-${chatId}`;
        await createChatMessage({ sessionId, text, fromAdmin: false });
        const recent = await getChatMessagesBySession(sessionId);
        const history: GeminiMessage[] = recent
          .slice(0, -1)
          .slice(-MAX_HISTORY)
          .map((m) => ({
            role: m.fromAdmin ? ("model" as const) : ("user" as const),
            parts: [{ text: m.text }],
          }));
        try {
          const replyTextRaw = await askGemini(keys, prompt, text, history);
          const replyText = stripPhoneTags(replyTextRaw);
          const phonesFromReply = extractPhonesFromText(replyTextRaw);
          const phonesFromUser = extractPhonesFromText(text);
          const allPhones = [...new Set([...phonesFromReply, ...phonesFromUser])];
          const telegramChatId = settings.telegramChatId?.trim();
          for (const phone of allPhones) {
            const exists = await hasLeadPhone(sessionId, phone);
            if (!exists) {
              await createLeadPhone(sessionId, phone);
              if (token && telegramChatId) await sendPhoneToTelegram(token, telegramChatId, phone, sessionId);
            }
          }
          await createChatMessage({ sessionId, text: replyText, fromAdmin: true });
          await sendMessage(chatId, replyText);
        } catch {
          await sendMessage(chatId, "Не удалось ответить, попробуйте позже.");
        }
      }
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ ok: true });
}
