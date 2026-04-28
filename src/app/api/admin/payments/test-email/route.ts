import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPaymentSettingsPrivate } from "@/lib/data";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as { to?: string } | null;
    const to = (body?.to ?? "").toString().trim();
    if (!to || !to.includes("@")) return NextResponse.json({ error: "Укажите email получателя" }, { status: 400 });

    const settings = await getPaymentSettingsPrivate();
    const host = settings.smtpHost?.trim();
    const port = settings.smtpPort ?? 587;
    const user = settings.smtpUser?.trim();
    const pass = settings.smtpPass?.trim();
    const from = settings.smtpFrom?.trim() || "kaktusa.ru <no-reply@kaktusa.ru>";
    if (!host || !user || !pass) {
      return NextResponse.json({ error: "SMTP не настроен (host/user/pass)" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject: "Тест SMTP — kaktusa.ru",
      html: `<div style="font-family:Arial,Helvetica,sans-serif">
        <p>Это тестовое письмо из админки kaktusa.ru.</p>
        <p>Если вы получили его — SMTP настроен правильно.</p>
        <p style="color:#666;font-size:12px">Отправлено: ${new Date().toISOString()}</p>
      </div>`,
    });

    return NextResponse.json({ ok: true, messageId: info?.messageId ?? null });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "SMTP test failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

