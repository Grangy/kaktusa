import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getEventBySlug } from "@/lib/data";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

const SITE_URL = "https://kaktusa.ru";

export default async function TicketVerifyPage({ params }: Props) {
  const { token } = await params;
  const row = await prisma.ticketOrder.findUnique({ where: { qrToken: token } });
  if (!row || row.status !== "succeeded") notFound();
  const ev = await getEventBySlug(row.eventSlug);

  const verifyUrl = `${SITE_URL}/ticket/${encodeURIComponent(token)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 520 });

  return (
    <main className="min-h-screen px-6 md:px-12 pt-28 pb-28">
      <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-8 md:p-10">
        <h1 className="font-display text-2xl md:text-3xl font-bold uppercase text-white mb-2">Билет действителен</h1>
        <p className="text-white/70">
          {ev?.title ?? row.eventSlug} · {ev?.dateDisplay ?? ""} {ev?.time ?? ""}
        </p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <div className="text-white/60 text-xs uppercase tracking-wider">Номер</div>
          <div className="text-white text-xl font-semibold">{row.ticketNumber ?? "—"}</div>
          {row.ticketName && <div className="text-white/60 text-sm">Тариф: {row.ticketName}</div>}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="text-white/60 text-xs uppercase tracking-wider">QR</div>
          <div className="mt-3 rounded-2xl bg-white p-3 w-full max-w-[360px]">
            {/* QR ведёт на эту же страницу билета */}
            <img src={qrDataUrl} alt="QR билет" className="w-full h-auto" />
          </div>
          <div className="mt-3 text-white/70 text-sm">Сохраните QR</div>
          <div className="mt-2 text-white/50 text-xs break-all">{verifyUrl}</div>
        </div>
      </div>
    </main>
  );
}

