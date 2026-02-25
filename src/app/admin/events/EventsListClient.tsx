"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/ToastProvider";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Loader2, Trash2, Calendar, Plus } from "lucide-react";
import type { Event } from "@/types/data";

export function EventsListClient({ events }: { events: Event[] }) {
  const router = useRouter();
  const toast = useToast();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);

  const eventToDelete = confirmSlug ? events.find((e) => e.slug === confirmSlug) : null;

  async function handleDelete(slug: string) {
    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/admin/events/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка удаления");
      }
      toast("success", "Мероприятие удалено");
      router.refresh();
      fetch("/api/admin/revalidate", { method: "POST" }).catch(() => {});
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setDeletingSlug(null);
      setConfirmSlug(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold uppercase">Мероприятия</h1>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-black font-display text-sm font-semibold uppercase rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={18} /> Создать
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/[0.02] p-12 text-center">
          <Calendar size={48} className="mx-auto text-white/30 mb-4" />
          <h2 className="font-display text-lg uppercase text-white/80 mb-2">Нет мероприятий</h2>
          <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
            Создайте первое мероприятие — оно появится на главной и получит свою страницу.
          </p>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-black font-display text-sm font-semibold uppercase rounded-lg hover:opacity-90"
          >
            <Plus size={18} /> Создать мероприятие
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id}>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-white/15 bg-white/[0.02] hover:border-white/25 transition-colors group">
                <Link
                  href={`/admin/events/${event.slug}`}
                  className="flex-1 min-w-0 block py-1"
                >
                  <span className="text-white/50 text-xs uppercase">{event.type}</span>
                  <h2 className="font-display text-lg font-bold uppercase mt-0.5 truncate">
                    {event.title}
                  </h2>
                  <p className="text-white/60 text-sm mt-0.5 truncate">
                    {event.dateDisplay} · {event.location}
                  </p>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/events/${event.slug}`}
                    className="px-3 py-2 rounded-lg border border-white/20 text-white/90 text-sm hover:bg-white/10 transition-colors"
                  >
                    Редактировать
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmSlug(event.slug)}
                    disabled={deletingSlug !== null}
                    className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-50"
                    title="Удалить"
                  >
                    {deletingSlug === event.slug ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={!!confirmSlug && !!eventToDelete}
        title="Удалить мероприятие?"
        message={
          eventToDelete
            ? `«${eventToDelete.title}» будет удалено безвозвратно. Это действие нельзя отменить.`
            : ""
        }
        confirmLabel="Удалить"
        variant="danger"
        onConfirm={() => confirmSlug && handleDelete(confirmSlug)}
        onCancel={() => setConfirmSlug(null)}
      />
    </>
  );
}
