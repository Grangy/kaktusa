import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { testGeminiKey, getGeminiKeysFromSettings } from "@/lib/gemini";
import { getChatSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * POST: тест ключей Gemini из текущих настроек.
 * GET с body/query не нужен — проверяем ключи из БД.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let keysInput: string[] | null = null;
    try {
      const body = await req.json().catch(() => ({})) as { keys?: string };
      if (body.keys && typeof body.keys === "string") {
        keysInput = getGeminiKeysFromSettings(body.keys);
      }
    } catch {
      // ignore
    }

    const keys = keysInput ?? getGeminiKeysFromSettings((await getChatSettings()).geminiApiKeys);

    if (keys.length === 0) {
      return NextResponse.json({
        ok: false,
        results: [],
        message: "Нет ключей для проверки. Укажите ключи в настройках или в теле запроса (keys).",
      });
    }

    const results: Array<{ key: string; ok: boolean; error?: string }> = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const masked = key.slice(0, 8) + "…" + key.slice(-4);
      const result = await testGeminiKey(key);
      results.push({
        key: masked,
        ok: result.ok,
        error: result.error,
      });
      if (result.ok) break;
    }

    const atLeastOne = results.some((r) => r.ok);
    return NextResponse.json({
      ok: atLeastOne,
      results,
      message: atLeastOne
        ? `Рабочий ключ: ${results.find((r) => r.ok)?.key}`
        : "Ни один ключ не сработал. Проверьте ключи в Google AI Studio.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка проверки ключей" }, { status: 500 });
  }
}
