"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useToast } from "./ToastProvider";

export function RevalidateCacheButton() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/revalidate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      toast("success", "Кэш сброшен — посетители увидят обновления");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Не удалось сбросить кэш");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm w-full disabled:opacity-50"
      title="Принудительно обновить кэш главной и страниц мероприятий"
    >
      <RefreshCw size={18} className={`shrink-0 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Сброс…" : "Очистить кэш"}
    </button>
  );
}
