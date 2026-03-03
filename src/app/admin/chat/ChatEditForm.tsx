"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatSettingsContent } from "@/types/data";
import { useToast } from "@/components/admin/ToastProvider";
import { AlertBanner } from "@/components/admin/AlertBanner";
import { Loader2, MessageCircle, Webhook } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 bg-black/50 border border-white/20 text-white rounded-lg focus:outline-none focus:border-[var(--accent)] placeholder:text-white/40";

export function ChatEditForm({ initial }: { initial: ChatSettingsContent }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<ChatSettingsContent>(initial);
  const [saving, setSaving] = useState(false);
  const [webhooking, setWebhooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка сохранения");
      toast("success", "Настройки чата сохранены");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      setError(msg);
      toast("error", msg);
    } finally {
      setSaving(false);
    }
  }

  async function setWebhook() {
    setWebhooking(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/chat/webhook", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Ошибка");
      toast("success", "Webhook установлен");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      setError(msg);
      toast("error", msg);
    } finally {
      setWebhooking(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && <AlertBanner variant="error" message={error} onDismiss={() => setError(null)} />}

      <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6 space-y-4">
        <h3 className="font-display text-lg uppercase text-white/90 flex items-center gap-2">
          <MessageCircle size={18} /> Мини-чат на сайте
        </h3>
        <p className="text-white/60 text-sm">
          Сообщения из чата приходят в Telegram. Ответы через инлайн-кнопку «Ответить» отображаются в чате на сайте. Укажите токен бота и ID чата (или группы).
        </p>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
            className="w-4 h-4 rounded border-white/30 bg-black/50 text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span className="text-white/80 text-sm">Чат включён</span>
        </label>

        <div>
          <label className="block text-white/80 text-sm mb-1">Токен бота Telegram</label>
          <input
            type="password"
            value={form.botToken ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, botToken: e.target.value || undefined }))}
            className={inputClass}
            placeholder="1234567890:ABC..."
            autoComplete="off"
          />
          <p className="text-white/50 text-xs mt-1">Получить у @BotFather</p>
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">ID чата (куда слать сообщения)</label>
          <input
            type="text"
            value={form.telegramChatId ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, telegramChatId: e.target.value || undefined }))}
            className={inputClass}
            placeholder="683203214 или -1001234567890 для группы"
          />
          <p className="text-white/50 text-xs mt-1">Числовой ID пользователя или группы (можно узнать у @userinfobot)</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-white/80 text-sm mb-1">Начало работы (МСК)</label>
            <input
              type="time"
              value={form.workStartMsk ?? "09:00"}
              onChange={(e) => setForm((f) => ({ ...f, workStartMsk: e.target.value || null }))}
              className={inputClass}
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-white/80 text-sm mb-1">Конец работы (МСК)</label>
            <input
              type="time"
              value={form.workEndMsk ?? "21:00"}
              onChange={(e) => setForm((f) => ({ ...f, workEndMsk: e.target.value || null }))}
              className={inputClass}
            />
          </div>
        </div>
        <p className="text-white/50 text-xs">Вне этого интервала чат на сайте будет показывать «временно недоступен».</p>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={setWebhook}
            disabled={webhooking || !form.botToken?.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {webhooking ? <Loader2 size={16} className="animate-spin" /> : <Webhook size={16} />}
            {webhooking ? "Установка…" : "Установить webhook"}
          </button>
          <p className="text-white/50 text-xs self-center">
            Нужно после смены токена, чтобы бот получал ответы.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-black font-display text-sm font-semibold uppercase rounded-lg hover:opacity-90 disabled:opacity-50 min-w-[140px]"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : null}
        {saving ? "Сохранение…" : "Сохранить"}
      </button>
    </form>
  );
}
