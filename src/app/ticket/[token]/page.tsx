import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getEventBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function TicketVerifyPage({ params }: Props) {
  const { token } = await params;
  const row = await prisma.ticketOrder.findUnique({ where: { qrToken: token } });
  if (!row || row.status !== "succeeded") notFound();
  const ev = await getEventBySlug(row.eventSlug);

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
      </div>
    </main>
  );
}

