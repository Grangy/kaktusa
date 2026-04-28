"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, CircleX } from "lucide-react";

type State = { status: "idle" | "checking" | "succeeded" | "pending" | "canceled" | "error"; message?: string };

export function PaymentReturnWatcher({ slug }: { slug: string }) {
  const params = useSearchParams();
  const enabled = params.get("return") === "1";
  const orderFromQuery = (params.get("order") || "").trim();

  const orderId = useMemo(() => {
    if (orderFromQuery) return orderFromQuery;
    try {
      const v = localStorage.getItem(`kaktusa:last_order:${slug}`) || "";
      return v.trim();
    } catch {
      return "";
    }
  }, [orderFromQuery, slug]);

  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (!enabled) return;
    if (!orderId) {
      setState({ status: "error", message: "Не нашли идентификатор заказа для проверки оплаты." });
      return;
    }
    let cancelled = false;
    setState({ status: "checking" });
    fetch(`/api/payments/yookassa/verify?order=${encodeURIComponent(orderId)}`, { cache: "no-store" })
      .then(async (r) => {
        const text = await r.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }
        if (!r.ok) throw new Error((data?.error as string | undefined) || text || `HTTP ${r.status}`);
        const status = (data?.status as string | undefined) || "pending";
        if (status === "succeeded") return { status: "succeeded" as const };
        if (status === "canceled") return { status: "canceled" as const };
        return { status: "pending" as const };
      })
      .then((res) => {
        if (cancelled) return;
        setState({ status: res.status });
      })
      .catch((e) => {
        if (cancelled) return;
        setState({ status: "error", message: e instanceof Error ? e.message : "Ошибка проверки оплаты" });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, orderId]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {state.status !== "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
        >
          <motion.div
            initial={{ y: 10, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-black/80 p-8 shadow-[0_12px_60px_-18px_rgba(0,0,0,0.9)]"
          >
            {state.status === "checking" ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/15 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[var(--accent)]" size={20} />
                </div>
                <div>
                  <p className="text-white font-medium">Проверяем оплату</p>
                  <p className="text-white/60 text-sm">Это займёт пару секунд…</p>
                </div>
              </div>
            ) : state.status === "succeeded" ? (
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="shrink-0 text-[var(--accent)]" />
                <div>
                  <p className="text-white font-medium">Оплата успешна</p>
                  <p className="text-white/60 text-sm mt-1">Билет отправлен на email. Можно закрыть это окно.</p>
                </div>
              </div>
            ) : state.status === "pending" ? (
              <div className="flex items-start gap-3">
                <Loader2 size={20} className="shrink-0 animate-spin text-white/60" />
                <div>
                  <p className="text-white font-medium">Оплата ещё обрабатывается</p>
                  <p className="text-white/60 text-sm mt-1">
                    Если вы только что оплатили — подождите минуту и обновите страницу. Билет придёт после подтверждения.
                  </p>
                </div>
              </div>
            ) : state.status === "canceled" ? (
              <div className="flex items-start gap-3">
                <CircleX size={20} className="shrink-0 text-red-400" />
                <div>
                  <p className="text-white font-medium">Оплата отменена</p>
                  <p className="text-white/60 text-sm mt-1">Если это ошибка — попробуйте ещё раз.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <CircleX size={20} className="shrink-0 text-red-400" />
                <div>
                  <p className="text-white font-medium">Не удалось проверить оплату</p>
                  <p className="text-white/60 text-sm mt-1">{state.message || "Ошибка"}</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

