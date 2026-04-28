import { NextResponse } from "next/server";
import { getChatSettings, getEventBySlug, getTicketOrderById, normalizePhone, setTicketOrderPhone } from "@/lib/data";
import { sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";

const SITE_URL = "https://kaktusa.ru";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { orderId?: string; phone?: string };
    const orderId = (body.orderId ?? "").toString().trim();
    const phoneRaw = (body.phone ?? "").toString().trim();
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    const phone = normalizePhone(phoneRaw);
    if (!phone) return NextResponse.json({ error: "Некорректный телефон. Формат: +7XXXXXXXXXX" }, { status: 400 });

    const order = await getTicketOrderById(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status !== "succeeded" || !order.qrToken || !order.ticketNumber) {
      return NextResponse.json({ error: "Order is not paid yet" }, { status: 400 });
    }

    await setTicketOrderPhone(orderId, phone);

    const ev = await getEventBySlug(order.eventSlug);
    const verifyUrl = `${SITE_URL}/ticket/${encodeURIComponent(order.qrToken)}`;

    const chat = await getChatSettings();
    const token = chat.botToken?.trim() || "";
    const chatId = chat.telegramChatId?.trim() || "";
    if (token && chatId) {
      const lines = [
        "🎟️ Новый купленный билет",
        `Мероприятие: ${ev?.title ?? order.eventSlug}`,
        `Тариф: ${order.ticketName ?? order.ticketId ?? "—"}`,
        `Сумма: ${order.amountValue} ${order.currency}`,
        `Телефон: ${phone}`,
        `Номер билета: ${order.ticketNumber}`,
        `Проверка: ${verifyUrl}`,
        order.paymentId ? `PaymentId: ${order.paymentId}` : "",
        `OrderId: ${order.id}`,
      ].filter(Boolean);
      await sendTelegramMessage({ token, chatId, text: lines.join("\n") });
    }

    return NextResponse.json({ ok: true, phone, verifyUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save phone" }, { status: 500 });
  }
}

