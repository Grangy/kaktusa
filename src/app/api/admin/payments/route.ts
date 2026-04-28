import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPaymentSettings, getPaymentSettingsPrivate, writePaymentSettings } from "@/lib/data";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await getPaymentSettings());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load payment settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      enabled?: boolean;
      yookassaShopId?: string | null;
      yookassaSecretKey?: string | null;
      webhookToken?: string | null;
      testOneRuble?: boolean;
      smtpHost?: string | null;
      smtpPort?: number | null;
      smtpUser?: string | null;
      smtpPass?: string | null;
      smtpFrom?: string | null;
    };
    const current = await getPaymentSettingsPrivate();

    const enabled = Boolean(body.enabled);
    const yookassaShopId = (body.yookassaShopId ?? "").toString().trim() || null;
    const incomingKey = typeof body.yookassaSecretKey === "string" ? body.yookassaSecretKey.trim() : null;
    const yookassaSecretKey = incomingKey ? incomingKey : current.secretKey; // пусто = не менять
    const webhookToken = typeof body.webhookToken === "string" ? body.webhookToken.trim() : null;
    const testOneRuble = Boolean(body.testOneRuble);

    const smtpHost = typeof body.smtpHost === "string" ? body.smtpHost.trim() : null;
    const smtpPort = typeof body.smtpPort === "number" && Number.isFinite(body.smtpPort) ? Math.trunc(body.smtpPort) : null;
    const smtpUser = typeof body.smtpUser === "string" ? body.smtpUser.trim() : null;
    const incomingSmtpPass = typeof body.smtpPass === "string" ? body.smtpPass.trim() : null;
    const smtpPass = incomingSmtpPass ? incomingSmtpPass : current.smtpPass; // пусто = не менять
    const smtpFrom = typeof body.smtpFrom === "string" ? body.smtpFrom.trim() : null;

    await writePaymentSettings({
      enabled,
      yookassaShopId,
      yookassaSecretKey,
      webhookToken,
      testOneRuble,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpFrom,
    });
    return NextResponse.json(await getPaymentSettings());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update payment settings" }, { status: 500 });
  }
}

