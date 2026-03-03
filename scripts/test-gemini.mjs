#!/usr/bin/env node
/**
 * Тест ключей Gemini API перед деплоем.
 * Использование: node scripts/test-gemini.mjs [key1] [key2] [key3]
 * Или: GEMINI_KEYS="key1,key2,key3" node scripts/test-gemini.mjs
 */

const keys = process.env.GEMINI_KEYS
  ? process.env.GEMINI_KEYS.split(/[\n,;]+/).map((k) => k.trim()).filter(Boolean)
  : process.argv.slice(2).filter(Boolean);

// gemini-2.5-flash — быстрая модель с хорошим балансом
const MODEL = "gemini-2.5-flash";
const GEMINI_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`;

async function testKey(key, index) {
  const masked = key.slice(0, 8) + "…" + key.slice(-4);
  try {
    const res = await fetch(GEMINI_URL(key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Скажи одно слово: привет" }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.log(`  Ключ ${index + 1} (${masked}): ❌ ${data.error?.message || res.status}`);
      return false;
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      console.log(`  Ключ ${index + 1} (${masked}): ✅ OK, ответ: "${text.trim()}"`);
      return true;
    }
    console.log(`  Ключ ${index + 1} (${masked}): ❌ Пустой ответ`);
  } catch (e) {
    console.log(`  Ключ ${index + 1} (${masked}): ❌ ${e.message}`);
  }
  return false;
}

async function main() {
  if (keys.length === 0) {
    console.log("Укажите ключи: node scripts/test-gemini.mjs AIzaSy... AIzaSy... AIzaSy...");
    console.log("Или: GEMINI_KEYS='key1\nkey2' node scripts/test-gemini.mjs");
    process.exit(1);
  }
  console.log(`Проверка ${keys.length} ключей Gemini API…\n`);
  for (let i = 0; i < keys.length; i++) {
    const ok = await testKey(keys[i], i);
    if (ok) {
      console.log("\n✅ Хотя бы один ключ работает. Можно деплоить.");
      process.exit(0);
    }
  }
  console.log("\n❌ Ни один ключ не сработал. Проверьте ключи в Google AI Studio.");
  process.exit(1);
}

main();
