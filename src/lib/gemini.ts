/**
 * Gemini API: запрос с перебором ключей (если один не работает — следующий).
 * Модель: gemini-1.5-flash (быстрая, под чат).
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;

export interface GeminiMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

function parseKeys(geminiApiKeys: string | null | undefined): string[] {
  if (!geminiApiKeys || !geminiApiKeys.trim()) return [];
  const raw = geminiApiKeys.trim();
  if (raw.startsWith("[")) {
    try {
      const arr = JSON.parse(raw) as unknown;
      return Array.isArray(arr) ? arr.filter((k): k is string => typeof k === "string" && k.length > 0) : [];
    } catch {
      return [];
    }
  }
  return raw
    .split(/[\n,;]+/)
    .map((k) => k.trim())
    .filter(Boolean);
}

/**
 * Один запрос к Gemini. Пробует ключи по порядку.
 */
export async function askGemini(
  apiKeys: string[],
  systemPrompt: string,
  userMessage: string,
  history: GeminiMessage[] = []
): Promise<string> {
  if (apiKeys.length === 0) {
    throw new Error("Нет ключей Gemini API");
  }

  const contents = [
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.parts[0].text }],
    })),
    { role: "user" as const, parts: [{ text: userMessage }] },
  ];

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  let lastError: Error | null = null;
  for (const key of apiKeys) {
    try {
      const res = await fetch(GEMINI_URL(key), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string; code?: number };
      };

      if (!res.ok) {
        lastError = new Error(data.error?.message || `HTTP ${res.status}`);
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
      lastError = new Error("Пустой ответ Gemini");
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError || new Error("Gemini API: все ключи недоступны");
}

/**
 * Парсит строку ключей из настроек и возвращает массив.
 */
export function getGeminiKeysFromSettings(geminiApiKeys: string | null | undefined): string[] {
  return parseKeys(geminiApiKeys);
}

/**
 * Проверка ключа: один простой запрос. Возвращает true, если ключ рабочий.
 */
export async function testGeminiKey(key: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(GEMINI_URL(key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Скажи одно слово: привет" }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    });
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string } };
    if (!res.ok) {
      return { ok: false, error: data.error?.message || `HTTP ${res.status}` };
    }
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { ok: true };
    }
    return { ok: false, error: "Пустой ответ" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
