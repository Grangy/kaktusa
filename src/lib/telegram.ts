export async function sendTelegramMessage(opts: { token: string; chatId: string; text: string }): Promise<void> {
  const token = opts.token.trim();
  const chatId = opts.chatId.trim();
  if (!token || !chatId) throw new Error("Telegram is not configured");
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: opts.text,
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data && (data.description || data.error || data.message)) || `Telegram error (HTTP ${res.status})`;
    throw new Error(msg);
  }
}

