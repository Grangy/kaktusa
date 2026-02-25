"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MetaContent } from "@/types/data";
import { useToast } from "@/components/admin/ToastProvider";
import { AlertBanner } from "@/components/admin/AlertBanner";
import { Loader2 } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 bg-black/50 border border-white/20 text-white rounded-lg focus:outline-none focus:border-[var(--accent)] placeholder:text-white/40";

export function MetaEditForm({ initial }: { initial: MetaContent }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<MetaContent>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/meta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка сохранения");
      toast("success", "Метатеги сохранены");
      router.refresh();
      fetch("/api/admin/revalidate", { method: "POST" }).catch(() => {});
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
      <div>
        <label className="block text-white/80 text-sm mb-1">Title (главная)</label>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={inputClass}
          rows={3}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Canonical URL</label>
        <input
          value={form.canonical ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, canonical: e.target.value || undefined }))}
          className={inputClass}
        />
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
