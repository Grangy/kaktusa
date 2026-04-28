import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventBySlug, getPaymentSettings } from "@/lib/data";
import { YooKassaCheckout } from "@/components/payments/YooKassaCheckout";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function EventPayPage({ params }: Props) {
  const { slug } = await params;
  const [event, payments] = await Promise.all([getEventBySlug(slug), getPaymentSettings()]);
  if (!event) notFound();
  if (event.type !== "upcoming") notFound();

  const paymentsConfigured = payments.enabled && !!payments.yookassaShopId && !!payments.yookassaSecretKeyMasked;
  if (paymentsConfigured) {
    return (
      <main className="min-h-screen px-6 md:px-12 pt-28 pb-28">
        <YooKassaCheckout event={event} />
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 md:px-12 pt-28 pb-20">
      <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-8 md:p-10 shadow-[0_8px_40px_-14px_rgba(0,0,0,0.8)]">
        <h1 className="font-display text-2xl md:text-3xl font-bold uppercase text-white mb-3">
          Оплата билета
        </h1>
        <p className="text-white/70 mb-6">
          Для мероприятия <span className="text-white">{event.title}</span> оплата ещё не настроена.
        </p>
        <p className="text-white/50 text-sm mb-6">
          Админке: откройте <span className="text-white/70">/admin/payments</span> и включите YooKassa (shopId + секретный ключ).
        </p>

        <div className="space-y-3">
          <a
            href="https://t.me/kaktusa_project"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-[var(--accent)] text-[var(--accent)] font-display text-sm font-semibold uppercase hover:bg-[var(--accent)]/15 transition-colors w-full"
          >
            Написать в Telegram
          </a>

          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 text-white/80 font-display text-sm font-semibold uppercase hover:bg-white/10 transition-colors w-full"
          >
            ← Вернуться к мероприятию
          </Link>
        </div>

        <p className="text-white/40 text-xs mt-8">
          Если вы попали сюда случайно — вернитесь на страницу мероприятия.
        </p>
      </div>
    </main>
  );
}

