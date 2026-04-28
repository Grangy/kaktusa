"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, QrCode, Wallet, ShieldCheck, CircleX, Loader2 } from "lucide-react";
import type { Event } from "@/types/data";

type MethodId = "card" | "sbp" | "yookassa";

const METHODS: Array<{ id: MethodId; label: string; icon: React.ReactNode; hint: string }> = [
  { id: "yookassa", label: "Юкасса", icon: <Wallet size={18} />, hint: "Выбор способа оплаты на стороне YooKassa" },
  { id: "card", label: "Карта", icon: <CreditCard size={18} />, hint: "Оплата банковской картой" },
  { id: "sbp", label: "СБП", icon: <QrCode size={18} />, hint: "Оплата через СБП" },
];

function pickDisplayPrice(price?: string) {
  const raw = (price ?? "").trim();
  if (!raw) return "—";
  return raw.replace(/^От\s+/i, "").trim();
}

export function YooKassaCheckout({ event }: { event: Event }) {
  const params = useSearchParams();
  const ticketId = params.get("ticket")?.trim() || null;

  const ticket = useMemo(() => {
    const list = event.tickets ?? [];
    if (!ticketId) return list[0] ?? null;
    return list.find((t) => t.id === ticketId) ?? list[0] ?? null;
  }, [event.tickets, ticketId]);

  const [method, setMethod] = useState<MethodId>("yookassa");
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  const title = event.title;
  const amount = ticket ? pickDisplayPrice(ticket.price) : pickDisplayPrice(event.price);

  const startPayment = async () => {
    if (status === "processing") return;
    setStatus("processing");
    setError(null);
    try {
      if (!email.trim() || !email.includes("@")) {
        throw new Error("Укажите email для чека");
      }
      const res = await fetch("/api/payments/yookassa/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: event.slug, ticketId: ticket?.id ?? null, method, customerEmail: email.trim() }),
      });
      const raw = await res.text();
      const data = (() => {
        try {
          return JSON.parse(raw) as any;
        } catch {
          return null;
        }
      })();
      if (!res.ok || !data?.confirmationUrl) {
        const hint =
          (data && typeof data.error === "string" && data.error.trim()) ||
          (raw && raw.trim() ? raw.trim().slice(0, 280) : "") ||
          "Не удалось создать платёж";
        throw new Error(`${hint}${res.ok ? "" : ` (HTTP ${res.status})`}`);
      }
      try {
        localStorage.setItem(`kaktusa:last_payment:${event.slug}`, data.paymentId || "");
        localStorage.setItem(`kaktusa:last_order:${event.slug}`, data.orderId || "");
      } catch {}
      window.location.href = data.confirmationUrl as string;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка";
      setError(msg);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-8 md:p-10 shadow-[0_8px_40px_-14px_rgba(0,0,0,0.8)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold uppercase text-white mb-2">Оплата билета</h1>
          <p className="text-white/70">
            Мероприятие: <span className="text-white">{title}</span>
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-white/60 text-xs">
          <ShieldCheck size={16} className="text-[var(--accent)]" />
          secure
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider">Сумма</p>
            <p className="text-white text-xl font-semibold mt-1">{amount}</p>
            {ticket?.name && (
              <p className="text-white/50 text-xs mt-1">
                Тариф: <span className="text-white/70">{ticket.name}</span>
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs uppercase tracking-wider">Провайдер</p>
            <p className="text-white/80 text-sm mt-1">YooKassa</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-white/70 text-xs uppercase tracking-wider mb-3">Способ оплаты</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {METHODS.map((m) => {
            const active = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={status === "processing"}
                onClick={() => setMethod(m.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                  active
                    ? "border-[var(--accent)]/60 bg-[var(--accent)]/10 text-white"
                    : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.04] hover:text-white"
                } ${status === "processing" ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={active ? "text-[var(--accent)]" : "text-white/60"}>{m.icon}</span>
                    <span className="font-medium">{m.label}</span>
                  </div>
                </div>
                <div className="text-white/50 text-xs mt-2">{m.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-white/70 text-xs uppercase tracking-wider mb-2">Email для чека</p>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputMode="email"
          autoComplete="email"
          placeholder="name@example.com"
          className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--accent)]"
          disabled={status === "processing"}
        />
        <p className="text-white/40 text-xs mt-2">Нужен для формирования чека (54‑ФЗ).</p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 flex items-start gap-3">
          <CircleX size={20} className="shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="text-white font-medium">Ошибка</p>
            <p className="text-white/60 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          disabled={status === "processing"}
          onClick={startPayment}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--accent)] text-[var(--accent)] font-display text-sm font-semibold uppercase hover:bg-[var(--accent)]/15 transition-colors w-full ${
            status === "processing" ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {status === "processing" ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
          Перейти к оплате
        </button>

        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 text-white/80 font-display text-sm font-semibold uppercase hover:bg-white/10 transition-colors w-full"
        >
          ← Назад к мероприятию
        </Link>
      </div>

      <AnimatePresence>
        {status === "processing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ y: 10, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-black/70 p-8 shadow-[0_12px_60px_-18px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/15 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[var(--accent)]" size={20} />
                </div>
                <div>
                  <p className="text-white font-medium">Создаём платёж</p>
                  <p className="text-white/60 text-sm">Сейчас перенаправим в YooKassa…</p>
                </div>
              </div>
              <p className="text-white/40 text-xs mt-6">Не закрывайте страницу.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

