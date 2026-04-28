"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentSettingsContent } from "@/types/data";
import { useToast } from "@/components/admin/ToastProvider";
import { AlertBanner } from "@/components/admin/AlertBanner";
import { Loader2, KeyRound, CreditCard } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 bg-black/50 border border-white/20 text-white rounded-lg focus:outline-none focus:border-[var(--accent)] placeholder:text-white/40";

export function PaymentsEditForm({ initial }: { initial: PaymentSettingsContent }) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testEmailTo, setTestEmailTo] = useState<string>("lololomik@gmail.com");
  const [testingEmail, setTestingEmail] = useState(false);

  // В UI никогда не показываем сохранённый ключ.
  const [enabled, setEnabled] = useState<boolean>(initial.enabled);
  const [shopId, setShopId] = useState<string>(initial.yookassaShopId ?? "");
  const [secretKey, setSecretKey] = useState<string>(""); // пусто = не менять
  const [testOneRuble, setTestOneRuble] = useState<boolean>(initial.testOneRuble ?? false);
  const [webhookToken, setWebhookToken] = useState<string>(initial.webhookToken ?? "");
  const [smtpHost, setSmtpHost] = useState<string>(initial.smtpHost ?? "");
  const [smtpPort, setSmtpPort] = useState<string>(initial.smtpPort ? String(initial.smtpPort) : "");
  const [smtpUser, setSmtpUser] = useState<string>(initial.smtpUser ?? "");
  const [smtpPass, setSmtpPass] = useState<string>(""); // пусто = не менять
  const [smtpFrom, setSmtpFrom] = useState<string>(initial.smtpFrom ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          yookassaShopId: shopId,
          // Отправляем только если введён новый ключ; иначе сервер оставит прежний.
          yookassaSecretKey: secretKey || null,
          webhookToken: webhookToken || null,
          testOneRuble,
          smtpHost: smtpHost || null,
          smtpPort: smtpPort.trim() ? Number(smtpPort.trim()) : null,
          smtpUser: smtpUser || null,
          smtpPass: smtpPass || null,
          smtpFrom: smtpFrom || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Ошибка сохранения");
      toast("success", "Настройки оплаты сохранены");
      setSecretKey("");
      setSmtpPass("");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      setError(msg);
      toast("error", msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    if (testingEmail) return;
    setTestingEmail(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmailTo.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Не удалось отправить тестовое письмо");
      toast("success", "Тестовое письмо отправлено (проверьте входящие/спам)");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      setError(msg);
      toast("error", msg);
    } finally {
      setTestingEmail(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && <AlertBanner variant="error" message={error} onDismiss={() => setError(null)} />}

      <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6 space-y-4">
        <h3 className="font-display text-lg uppercase text-white/90 flex items-center gap-2">
          <CreditCard size={18} /> YooKassa API
        </h3>
        <p className="text-white/60 text-sm">
          Платёж создаётся на сервере и пользователь перенаправляется на страницу оплаты YooKassa (confirmation_url).
        </p>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-white/30 bg-black/50 text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span className="text-white/80 text-sm">Оплата включена</span>
        </label>

        <div>
          <label className="block text-white/80 text-sm mb-1">Идентификатор магазина (shopId)</label>
          <input
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
            className={inputClass}
            placeholder="Например: 100500"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">Секретный ключ</label>
          <div className="relative">
            <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder={initial.yookassaSecretKeyMasked ? "•••••••• (не менять)" : "live_… или test_…"}
              autoComplete="off"
            />
          </div>
          <p className="text-white/50 text-xs mt-1">
            Мы не показываем сохранённый ключ. Чтобы заменить — вставьте новый и сохраните.
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={testOneRuble}
            onChange={(e) => setTestOneRuble(e.target.checked)}
            className="w-4 h-4 rounded border-white/30 bg-black/50 text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span className="text-white/80 text-sm">Режим теста: любой билет за 1 ₽</span>
        </label>

        <div className="rounded-lg border border-white/10 bg-black/30 p-4">
          <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Webhook URL</p>
          <div className="grid gap-3">
            <div>
              <label className="block text-white/70 text-sm mb-1">Webhook token</label>
              <input
                value={webhookToken}
                onChange={(e) => setWebhookToken(e.target.value)}
                className={inputClass}
                placeholder="любой секретный токен"
                autoComplete="off"
              />
              <p className="text-white/40 text-xs mt-1">
                Добавится к URL как <span className="text-white/60">?token=…</span> — защита от поддельных запросов.
              </p>
            </div>
          </div>
          <p className="text-white/80 text-sm break-all">
            https://kaktusa.ru/api/payments/yookassa/webhook{webhookToken ? `?token=${webhookToken}` : ""}
          </p>
          <p className="text-white/40 text-xs mt-2">
            Укажи этот URL в YooKassa → Интеграция → HTTP‑уведомления (payment.succeeded, payment.canceled).
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6 space-y-4">
        <h3 className="font-display text-lg uppercase text-white/90">SMTP (отправка билетов)</h3>
        <p className="text-white/60 text-sm">
          Используется для отправки билетов после <span className="text-white/80">payment.succeeded</span> в webhook.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-white/80 text-sm mb-1">SMTP host</label>
            <input
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              className={inputClass}
              placeholder="smtp.gmail.com"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">SMTP port</label>
            <input
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              className={inputClass}
              placeholder="465"
              autoComplete="off"
              inputMode="numeric"
            />
            <p className="text-white/40 text-xs mt-1">465 = SSL, 587 = STARTTLS.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-white/80 text-sm mb-1">SMTP user</label>
            <input
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className={inputClass}
              placeholder="you@gmail.com"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">SMTP pass (пароль приложения)</label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              className={inputClass}
              placeholder={initial.smtpPassMasked ? "•••••••• (не менять)" : "app password (16 символов)"}
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">From</label>
          <input
            value={smtpFrom}
            onChange={(e) => setSmtpFrom(e.target.value)}
            className={inputClass}
            placeholder="lololomik@gmail.com"
            autoComplete="off"
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Тестовое письмо</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={testEmailTo}
              onChange={(e) => setTestEmailTo(e.target.value)}
              className={inputClass}
              placeholder="email@domain.ru"
              autoComplete="off"
              inputMode="email"
              disabled={saving || testingEmail}
            />
            <button
              type="button"
              disabled={saving || testingEmail}
              onClick={handleTestEmail}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-white/15 text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50 min-w-[170px]"
            >
              {testingEmail ? <Loader2 size={18} className="animate-spin" /> : null}
              {testingEmail ? "Отправляем…" : "Отправить тест"}
            </button>
          </div>
          <p className="text-white/40 text-xs mt-2">Если не пришло — проверьте “Спам”. Ошибка покажется сверху.</p>
        </div>
      </div>

      <div className="flex gap-4 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-black font-display text-sm font-semibold uppercase rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity min-w-[140px]"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : null}
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}

