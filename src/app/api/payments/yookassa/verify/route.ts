import { NextResponse } from "next/server";
import { getEventBySlug, getPaymentSettingsPrivate, getTicketOrderById, markTicketOrderCanceled, markTicketOrderSucceeded } from "@/lib/data";
import QRCode from "qrcode";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const SITE_URL = "https://kaktusa.ru";

function maskEmail(e: string) {
  const [u, d] = e.split("@");
  if (!u || !d) return "***";
  return `${u.slice(0, 2)}***@${d}`;
}

function generateTicketNumber(eventSlug: string) {
  const rand = Math.floor(100000 + Math.random() * 900000);
  const prefix = eventSlug.replace(/[^a-z0-9]/gi, "").slice(0, 10).toUpperCase();
  return `KKT-${prefix}-${rand}`;
}

function generateQrToken() {
  return (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`).replace(
    /[^a-zA-Z0-9_-]/g,
    ""
  );
}

async function sendTicketEmail(opts: { to: string; subject: string; html: string }) {
  const settings = await getPaymentSettingsPrivate();
  const host = settings.smtpHost?.trim();
  const port = settings.smtpPort ?? 587;
  const user = settings.smtpUser?.trim();
  const pass = settings.smtpPass?.trim();
  const from = settings.smtpFrom?.trim() || "kaktusa.ru <no-reply@kaktusa.ru>";
  if (!host || !user || !pass) throw new Error("SMTP is not configured");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order")?.trim() || "";
    if (!orderId) return NextResponse.json({ error: "Missing order" }, { status: 400 });

    const order = await getTicketOrderById(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.status === "succeeded") return NextResponse.json({ ok: true, status: "succeeded" });
    if (order.status === "canceled") return NextResponse.json({ ok: true, status: "canceled" });
    if (!order.paymentId) return NextResponse.json({ ok: true, status: "pending" });

    const settings = await getPaymentSettingsPrivate();
    if (!settings.enabled || !settings.shopId || !settings.secretKey) {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    const auth = Buffer.from(`${settings.shopId}:${settings.secretKey}`).toString("base64");
    const pRes = await fetch(`https://api.yookassa.ru/v3/payments/${order.paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    const pData = (await pRes.json().catch(() => null)) as any;
    const status = (pData?.status as string | undefined) ?? "unknown";

    if (status === "canceled") {
      await markTicketOrderCanceled(order.id);
      return NextResponse.json({ ok: true, status: "canceled" });
    }

    if (status !== "succeeded") {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    const ticketNumber = order.ticketNumber ?? generateTicketNumber(order.eventSlug);
    const qrToken = order.qrToken ?? generateQrToken();
    const updated = await markTicketOrderSucceeded({ id: order.id, ticketNumber, qrToken });
    const ev = await getEventBySlug(updated.eventSlug);

    const verifyUrl = `${SITE_URL}/ticket/${encodeURIComponent(qrToken)}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 420 });

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#0b0b0b;color:#fff;padding:24px">
        <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.12);border-radius:18px;overflow:hidden;background:rgba(255,255,255,0.04)">
          <div style="padding:22px 22px 10px">
            <div style="letter-spacing:0.22em;text-transform:uppercase;font-weight:700;font-size:14px;color:rgba(255,255,255,0.75)">?КАКТУСА — билет</div>
            <div style="margin-top:10px;font-size:26px;font-weight:800;text-transform:uppercase">${(ev?.title ?? updated.eventSlug).toString()}</div>
            <div style="margin-top:6px;color:rgba(255,255,255,0.75);font-size:14px">
              ${ev?.dateDisplay ?? ""}${ev?.time ? ` · ${ev.time}` : ""} · ${ev?.venueTitle ?? ev?.location ?? ""}
            </div>
          </div>

          <div style="display:flex;gap:18px;align-items:center;padding:18px 22px 22px;flex-wrap:wrap">
            <div style="flex:1;min-width:240px">
              <div style="color:rgba(255,255,255,0.55);font-size:12px;text-transform:uppercase;letter-spacing:0.18em">Номер билета</div>
              <div style="font-size:20px;font-weight:800;margin-top:6px">${ticketNumber}</div>
              <div style="margin-top:14px;color:rgba(255,255,255,0.55);font-size:12px;text-transform:uppercase;letter-spacing:0.18em">Email</div>
              <div style="font-size:14px;margin-top:6px">${maskEmail(updated.email)}</div>
              <div style="margin-top:14px;color:rgba(255,255,255,0.55);font-size:12px;text-transform:uppercase;letter-spacing:0.18em">Проверка</div>
              <div style="font-size:12px;margin-top:6px;color:#9ae6b4"><a href="${verifyUrl}" style="color:#9ae6b4">${verifyUrl}</a></div>
            </div>
            <div style="width:220px;height:220px;border-radius:16px;background:#fff;padding:12px">
              <img src="${qrDataUrl}" alt="QR" style="width:100%;height:100%;object-fit:contain" />
            </div>
          </div>

          <div style="padding:14px 22px 20px;border-top:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.55);font-size:12px">
            Покажите QR на входе. Это автоматическое письмо.
          </div>
        </div>
      </div>
    `;

    await sendTicketEmail({
      to: updated.email,
      subject: `Билет ?КАКТУСА — ${ev?.title ?? updated.eventSlug}`,
      html,
    });

    return NextResponse.json({ ok: true, status: "succeeded" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}

