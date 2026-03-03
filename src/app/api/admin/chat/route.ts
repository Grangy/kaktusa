import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getChatSettings, writeChatSettings } from "@/lib/data";
import type { ChatSettingsContent } from "@/types/data";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const settings = await getChatSettings();
    return NextResponse.json(settings);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load chat settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await req.json()) as ChatSettingsContent;
    await writeChatSettings({
      enabled: Boolean(body.enabled),
      botToken: body.botToken ?? null,
      telegramChatId: body.telegramChatId ?? null,
      workStartMsk: body.workStartMsk?.trim() || null,
      workEndMsk: body.workEndMsk?.trim() || null,
      chatMode: body.chatMode ?? "telegram",
      geminiPrompt: body.geminiPrompt?.trim() || null,
      geminiApiKeys: body.geminiApiKeys?.trim() || null,
    });
    revalidatePath("/");
    revalidatePath("/api/chat/config");
    return NextResponse.json(await getChatSettings());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update chat settings" }, { status: 500 });
  }
}
