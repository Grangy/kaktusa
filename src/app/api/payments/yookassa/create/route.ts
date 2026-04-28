import { NextResponse } from "next/server";
import { getEventBySlug, getPaymentSettingsPrivate } from "@/lib/data";

export const runtime = "nodejs";

const SITE_URL = "https://kaktusa.ru";

function parseRubleAmountToValue(raw: string): string | null {
  const s = raw.replace(/[^\d.,]/g, "").replace(/\s+/g, "").trim();
  if (!s) return null;
  // "1.500" from admin sometimes; treat as thousands separator if no decimals
  const normalized = s.includes(",") ? s.replace(",", ".") : s;
  // if more than one dot -> remove all but last
  const parts = normalized.split(".");
  let numStr = normalized;
  if (parts.length > 2) {
    const last = parts.pop()!;
    numStr = parts.join("") + "." + last;
  }
  const n = Number(numStr);
  if (!isFinite(n) || n <= 0) return null;
  return n.toFixed(2);
}

type Method = "card" | "sbp" | "yookassa";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      slug?: string;
      ticketId?: string | null;
      method?: Method;
      customerEmail?: string | null;
    };
    const slug = (body.slug ?? "").trim();
    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    const event = await getEventBySlug(slug);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (event.type !== "upcoming") return NextResponse.json({ error: "Event is not upcoming" }, { status: 400 });

    const settings = await getPaymentSettingsPrivate();
    if (!settings.enabled) return NextResponse.json({ error: "Payments are disabled" }, { status: 400 });
    const shopId = settings.shopId?.trim();
    const secretKey = settings.secretKey?.trim();
    if (!shopId || !secretKey) return NextResponse.json({ error: "YooKassa is not configured" }, { status: 400 });

    const ticketId = (body.ticketId ?? "").toString().trim();
    const ticket = ticketId ? event.tickets?.find((t) => t.id === ticketId) : (event.tickets?.[0] ?? null);
    const priceRaw = ticket?.price ?? event.price ?? "";
    const value = parseRubleAmountToValue(priceRaw);
    if (!value) return NextResponse.json({ error: "Invalid ticket price" }, { status: 400 });

    const customerEmail = (body.customerEmail ?? "").toString().trim();
    if (!customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json({ error: "Email is required for receipt" }, { status: 400 });
    }

    const method = (body.method ?? "yookassa") as Method;
    const payment_method_data =
      method === "card"
        ? { type: "bank_card" }
        : method === "sbp"
          ? { type: "sbp" }
          : undefined; // "yookassa" = let YooKassa show available methods

    const return_url = `${SITE_URL}/events/${event.slug}/pay?return=1`;
    const description = `Билет: ${event.title}${ticket?.name ? ` — ${ticket.name}` : ""}`;

    const idempotenceKey =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

    const payload: Record<string, unknown> = {
      amount: { value, currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url },
      description: description.slice(0, 128),
      receipt: {
        customer: { email: customerEmail },
        items: [
          {
            description: `Билет: ${event.title}${ticket?.name ? ` — ${ticket.name}` : ""}`.slice(0, 128),
            quantity: "1.00",
            amount: { value, currency: "RUB" },
            vat_code: 1, // без НДС
            payment_subject: "service",
            payment_mode: "full_payment",
          },
        ],
      },
      metadata: {
        event_slug: event.slug,
        ticket_id: ticket?.id ?? null,
        ticket_name: ticket?.name ?? null,
      },
    };
    if (payment_method_data) payload.payment_method_data = payment_method_data;

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
    const res = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Idempotence-Key": idempotenceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      const msg = data?.description || data?.message || "YooKassa error";
      return NextResponse.json({ error: msg, details: data ?? undefined }, { status: 400 });
    }

    const confirmationUrl = data?.confirmation?.confirmation_url as string | undefined;
    const paymentId = data?.id as string | undefined;
    if (!confirmationUrl || !paymentId) {
      return NextResponse.json({ error: "Invalid response from YooKassa" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, paymentId, confirmationUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}

