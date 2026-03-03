import { NextResponse } from "next/server";
import {
  getChatSettings,
  isChatWithinWorkingHours,
  createChatMessage,
  getChatMessagesBySession,
  normalizePhone,
  createLeadPhone,
  hasLeadPhone,
} from "@/lib/data";
import {
  askGemini,
  getGeminiKeysFromSettings,
  type GeminiMessage,
} from "@/lib/gemini";

export const dynamic = "force-dynamic";
const MAX_HISTORY = 10;

const PHONE_TAG = /\[PHONE:(.+?)\]/g;
const RUSSIAN_PHONE = /(?:\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}|\b\d{10,11}\b/g;

function extractPhonesFromText(text: string): string[] {
  const normalized = new Set<string>();
  const tagMatch = text.matchAll(PHONE_TAG);
  for (const m of tagMatch) {
    const n = normalizePhone(m[1].trim());
    if (n) normalized.add(n);
  }
  const digitBlocks = text.match(RUSSIAN_PHONE) ?? [];
  for (const block of digitBlocks) {
    const n = normalizePhone(block);
    if (n) normalized.add(n);
  }
  return [...normalized];
}

function stripPhoneTags(text: string): string {
  return text.replace(/\s*\n?\[PHONE:.+?\]\s*/g, "").trim();
}

async function sendPhoneToTelegram(token: string, chatId: string, phone: string, sessionId: string): Promise<void> {
  const msg = `📱 Номер из чата: ${phone}\nСессия: ${sessionId.slice(0, 12)}…`;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: msg }),
  }).catch(() => {});
}

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

    const mode = settings.chatMode === "gemini" ? "gemini" : "telegram";

    if (mode === "gemini") {
      const keys = getGeminiKeysFromSettings(settings.geminiApiKeys);
      const basePrompt =
        settings.geminiPrompt?.trim() ||
        "Ты помощник на сайте мероприятия. Отвечай кратко и по делу на вопросы гостей.";
      const phoneInstruction = `

[ВАЖНО] Когда гость оставляет номер телефона (для SMS о мероприятиях), в конце своего ответа добавь с новой строки ровно одну строку в формате [PHONE:+79001234567] — номер в E.164 (РФ: +7 и 10 цифр). Эту строку пользователь не увидит: система её уберёт и сохранит номер, отправит в Telegram.`;
      const prompt = basePrompt + phoneInstruction;
      if (keys.length === 0) {
        return NextResponse.json(
          { error: "Не настроены ключи Gemini. Укажите ключи в админке." },
          { status: 503 }
        );
      }
      const recent = await getChatMessagesBySession(sessionId);
      const msg = await createChatMessage({
        sessionId,
        text,
        fromAdmin: false,
      });
      try {
        const history: GeminiMessage[] = recent.slice(-MAX_HISTORY).map((m) => ({
          role: m.fromAdmin ? ("model" as const) : ("user" as const),
          parts: [{ text: m.text }],
        }));
        const replyTextRaw = await askGemini(keys, prompt, text, history);
        const replyText = stripPhoneTags(replyTextRaw);
        const phonesFromReply = extractPhonesFromText(replyTextRaw);
        const phonesFromUser = extractPhonesFromText(text);
        const allPhones = [...new Set([...phonesFromReply, ...phonesFromUser])];
        const token = settings.botToken?.trim();
        const chatId = settings.telegramChatId?.trim();
        for (const phone of allPhones) {
          const exists = await hasLeadPhone(sessionId, phone);
          if (!exists) {
            await createLeadPhone(sessionId, phone);
            if (token && chatId) await sendPhoneToTelegram(token, chatId, phone, sessionId);
          }
        }
        const replyMsg = await createChatMessage({
          sessionId,
          text: replyText,
          fromAdmin: true,
        });
        return NextResponse.json({
          id: msg.id,
          createdAt: msg.createdAt,
          reply: {
            id: replyMsg.id,
            text: replyMsg.text,
            fromAdmin: true,
            createdAt: replyMsg.createdAt.toISOString(),
          },
        });
      } catch (geminiErr) {
        console.error("Gemini error:", geminiErr);
        return NextResponse.json(
          { error: "Ошибка ответа бота. Попробуйте позже." },
          { status: 502 }
        );
      }
    }

    // Режим Telegram
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
