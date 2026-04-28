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

    const body = (await req.json()) as { enabled?: boolean; yookassaShopId?: string | null; yookassaSecretKey?: string | null };
    const current = await getPaymentSettingsPrivate();

    const enabled = Boolean(body.enabled);
    const yookassaShopId = (body.yookassaShopId ?? "").toString().trim() || null;
    const incomingKey = typeof body.yookassaSecretKey === "string" ? body.yookassaSecretKey.trim() : null;
    const yookassaSecretKey = incomingKey ? incomingKey : current.secretKey; // пусто = не менять

    await writePaymentSettings({ enabled, yookassaShopId, yookassaSecretKey });
    return NextResponse.json(await getPaymentSettings());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update payment settings" }, { status: 500 });
  }
}

