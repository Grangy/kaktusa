"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, CircleX } from "lucide-react";

type State = {
  status: "idle" | "checking" | "succeeded" | "pending" | "canceled" | "error";
  message?: string;
  verifyUrl?: string | null;
  phoneRequired?: boolean;
};

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
  const [phone, setPhone] = useState<string>("");
  const [sendingPhone, setSendingPhone] = useState(false);

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
        if (status === "succeeded")
          return {
            status: "succeeded" as const,
            verifyUrl: (data?.verifyUrl as string | undefined) ?? null,
            phoneRequired: Boolean(data?.phoneRequired),
          };
        if (status === "canceled") return { status: "canceled" as const };
        return { status: "pending" as const };
      })
      .then((res) => {
        if (cancelled) return;
        setState(res as State);
      })
      .catch((e) => {
        if (cancelled) return;
        setState({ status: "error", message: e instanceof Error ? e.message : "Ошибка проверки оплаты" });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, orderId]);

  useEffect(() => {
    if (!enabled) return;
    if (state.status !== "succeeded") return;
    if (state.phoneRequired) return;
    const t = window.setTimeout(() => setState({ status: "idle" }), 3500);
    return () => window.clearTimeout(t);
  }, [enabled, state.status, state.phoneRequired]);

  async function submitPhone() {
    if (sendingPhone) return;
    setSendingPhone(true);
    setState((s) => ({ ...s, message: undefined }));
    try {
      const res = await fetch("/api/payments/tickets/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Не удалось сохранить телефон");
      setState((s) => ({ ...s, phoneRequired: false }));
      const t = window.setTimeout(() => setState({ status: "idle" }), 2500);
      return () => window.clearTimeout(t);
    } catch (e) {
      setState((s) => ({ ...s, status: "error", message: e instanceof Error ? e.message : "Ошибка" }));
    } finally {
      setSendingPhone(false);
    }
  }

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
                <div className="flex-1">
                  <p className="text-white font-medium">Оплата успешна</p>
                  {state.phoneRequired ? (
                    <>
                      <p className="text-white/60 text-sm mt-1">
                        Укажите номер телефона — и мы отправим информацию о билете в Telegram организаторам.
                      </p>
                      <div className="mt-4 space-y-3">
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--accent)]"
                          placeholder="+7XXXXXXXXXX"
                          inputMode="tel"
                          disabled={sendingPhone}
                        />
                        <button
                          type="button"
                          disabled={sendingPhone}
                          onClick={submitPhone}
                          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[var(--accent)]/60 bg-[var(--accent)]/10 text-white hover:bg-[var(--accent)]/15 transition-colors disabled:opacity-50"
                        >
                          {sendingPhone ? <Loader2 size={18} className="animate-spin" /> : null}
                          {sendingPhone ? "Сохраняем…" : "Отправить"}
                        </button>
                        {state.verifyUrl ? (
                          <a className="block text-xs text-white/60 underline underline-offset-2" href={state.verifyUrl}>
                            Открыть билет
                          </a>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-white/60 text-sm mt-1">Билет доступен на сайте.</p>
                      {state.verifyUrl ? (
                        <a className="block mt-3 text-sm text-[var(--accent)] underline underline-offset-2" href={state.verifyUrl}>
                          Открыть билет
                        </a>
                      ) : null}
                    </>
                  )}
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl border border-white/15 text-white/80 hover:bg-white/10 transition-colors text-sm"
                    onClick={() => setState({ status: "idle" })}
                  >
                    Закрыть
                  </button>
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
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl border border-white/15 text-white/80 hover:bg-white/10 transition-colors text-sm"
                    onClick={() => setState({ status: "idle" })}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            ) : state.status === "canceled" ? (
              <div className="flex items-start gap-3">
                <CircleX size={20} className="shrink-0 text-red-400" />
                <div>
                  <p className="text-white font-medium">Оплата отменена</p>
                  <p className="text-white/60 text-sm mt-1">Если это ошибка — попробуйте ещё раз.</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl border border-white/15 text-white/80 hover:bg-white/10 transition-colors text-sm"
                    onClick={() => setState({ status: "idle" })}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <CircleX size={20} className="shrink-0 text-red-400" />
                <div>
                  <p className="text-white font-medium">Не удалось проверить оплату</p>
                  <p className="text-white/60 text-sm mt-1">{state.message || "Ошибка"}</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl border border-white/15 text-white/80 hover:bg-white/10 transition-colors text-sm"
                    onClick={() => setState({ status: "idle" })}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

