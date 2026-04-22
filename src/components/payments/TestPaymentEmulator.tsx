"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, QrCode, Wallet, ShieldCheck, CircleCheck, CircleX, Loader2 } from "lucide-react";
import type { Event } from "@/types/data";

type MethodId = "card" | "sbp" | "yookassa";

const METHODS: Array<{ id: MethodId; label: string; icon: React.ReactNode }> = [
  { id: "card", label: "Карта", icon: <CreditCard size={18} /> },
  { id: "sbp", label: "СБП", icon: <QrCode size={18} /> },
  { id: "yookassa", label: "Юкасса", icon: <Wallet size={18} /> },
];

type Status = "idle" | "processing" | "success" | "error";

function pickDisplayPrice(price?: string) {
  const raw = (price ?? "").trim();
  if (!raw) return "—";
  return raw.replace(/^От\s+/i, "").trim();
}

export function TestPaymentEmulator({ event }: { event: Event }) {
  const params = useSearchParams();
  const ticketId = params.get("ticket")?.trim() || null;

  const ticket = useMemo(() => {
    const list = event.tickets ?? [];
    if (!ticketId) return list[0] ?? null;
    return list.find((t) => t.id === ticketId) ?? list[0] ?? null;
  }, [event.tickets, ticketId]);

  const [method, setMethod] = useState<MethodId>("card");
  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState(0);

  const title = event.title;
  const amount = ticket ? pickDisplayPrice(ticket.price) : pickDisplayPrice(event.price);

  const processingText = useMemo(() => {
    const steps = [
      "Проверяем данные…",
      "Создаём платёж…",
      "Ожидаем подтверждение…",
      "Завершаем…",
    ];
    return steps[Math.min(step, steps.length - 1)];
  }, [step]);

  const runPayment = async () => {
    if (status === "processing") return;
    setStatus("processing");
    setStep(0);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await wait(450);
    setStep(1);
    await wait(650);
    setStep(2);
    await wait(950);
    setStep(3);
    await wait(650);
    const ok = Math.random() > 0.12;
    setStatus(ok ? "success" : "error");
  };

  const reset = () => {
    setStatus("idle");
    setStep(0);
  };

  return (
    <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-8 md:p-10 shadow-[0_8px_40px_-14px_rgba(0,0,0,0.8)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold uppercase text-white mb-2">Тестовая оплата</h1>
          <p className="text-white/70">
            Эмуляция платёжной системы для мероприятия <span className="text-white">{title}</span>.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-white/60 text-xs">
          <ShieldCheck size={16} className="text-[var(--accent)]" />
          sandbox
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
            <p className="text-white/60 text-xs uppercase tracking-wider">Метод</p>
            <p className="text-white/80 text-sm mt-1">{METHODS.find((m) => m.id === method)?.label}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-white/70 text-xs uppercase tracking-wider mb-3">Выберите способ оплаты</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {METHODS.map((m) => {
            const active = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={status === "processing"}
                onClick={() => setMethod(m.id)}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition-colors ${
                  active
                    ? "border-[var(--accent)]/60 bg-[var(--accent)]/10 text-white"
                    : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.04] hover:text-white"
                } ${status === "processing" ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <span className={active ? "text-[var(--accent)]" : "text-white/60"}>{m.icon}</span>
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          disabled={status === "processing"}
          onClick={runPayment}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--accent)] text-[var(--accent)] font-display text-sm font-semibold uppercase hover:bg-[var(--accent)]/15 transition-colors w-full ${
            status === "processing" ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {status === "processing" ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
          Оплатить (тест)
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
                  <p className="text-white font-medium">Обработка платежа</p>
                  <p className="text-white/60 text-sm">{processingText}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--accent)]"
                    initial={{ width: "10%" }}
                    animate={{ width: step === 0 ? "22%" : step === 1 ? "45%" : step === 2 ? "72%" : "92%" }}
                    transition={{ duration: 0.35 }}
                  />
                </div>
                <p className="text-white/40 text-xs mt-2">Это тестовая эмуляция, реальные списания не выполняются.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {status === "success" && (
        <div className="mt-8 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-5 flex items-start gap-3">
          <CircleCheck size={20} className="shrink-0 text-[var(--accent)]" />
          <div>
            <p className="text-white font-medium">Оплата успешна (тест)</p>
            <p className="text-white/60 text-sm mt-1">
              Можно продолжать интеграцию: здесь будет реальный редирект/вебхук/статус.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 flex items-start gap-3">
          <CircleX size={20} className="shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="text-white font-medium">Платёж не прошёл (тест)</p>
            <p className="text-white/60 text-sm mt-1">Эмуляция ошибки платёжного провайдера. Попробуйте ещё раз.</p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={reset}
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/[0.03] text-white/80 text-sm hover:bg-white/[0.06] transition-colors"
              >
                Изменить метод
              </button>
              <button
                type="button"
                onClick={runPayment}
                className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-white/90 text-sm hover:bg-red-500/15 transition-colors"
              >
                Повторить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

