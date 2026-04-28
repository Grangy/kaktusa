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

  // В UI никогда не показываем сохранённый ключ.
  const [enabled, setEnabled] = useState<boolean>(initial.enabled);
  const [shopId, setShopId] = useState<string>(initial.yookassaShopId ?? "");
  const [secretKey, setSecretKey] = useState<string>(""); // пусто = не менять

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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Ошибка сохранения");
      toast("success", "Настройки оплаты сохранены");
      setSecretKey("");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      setError(msg);
      toast("error", msg);
    } finally {
      setSaving(false);
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

