"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/ToastProvider";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Loader2, Trash2, Calendar, Plus, GripVertical } from "lucide-react";
import type { Event } from "@/types/data";

export function EventsListClient({ events: initialEvents }: { events: Event[] }) {
  const router = useRouter();
  const toast = useToast();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const [draggedSlug, setDraggedSlug] = useState<string | null>(null);
  const [dragOverSlug, setDragOverSlug] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const eventToDelete = confirmSlug ? events.find((e) => e.slug === confirmSlug) : null;

  const slugOrderKey = initialEvents.map((e) => e.slug).join(",");
  useEffect(() => {
    setEvents(initialEvents);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only when server list (by slug order) changes
  }, [slugOrderKey]);

  async function handleReorder(newOrder: Event[]) {
    setSavingOrder(true);
    try {
      const res = await fetch("/api/admin/events/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: newOrder.map((e) => e.slug) }),
      });
      if (!res.ok) throw new Error("Ошибка сохранения порядка");
      setEvents(newOrder);
      toast("success", "Порядок сохранён");
      router.refresh();
      fetch("/api/admin/revalidate", { method: "POST" }).catch(() => {});
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSavingOrder(false);
    }
  }

  function handleDragStart(e: React.DragEvent, slug: string) {
    setDraggedSlug(slug);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", slug);
  }

  function handleDragOver(e: React.DragEvent, slug: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSlug(slug);
  }

  function handleDragLeave() {
    setDragOverSlug(null);
  }

  function handleDrop(e: React.DragEvent, overSlug: string) {
    e.preventDefault();
    setDragOverSlug(null);
    setDraggedSlug(null);
    const fromSlug = e.dataTransfer.getData("text/plain");
    if (!fromSlug || fromSlug === overSlug) return;
    const fromIdx = events.findIndex((ev) => ev.slug === fromSlug);
    const toIdx = events.findIndex((ev) => ev.slug === overSlug);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...events];
    const [removed] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, removed);
    handleReorder(next);
  }

  function handleDragEnd() {
    setDraggedSlug(null);
    setDragOverSlug(null);
  }

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
            <li
              key={event.id}
              draggable
              onDragStart={(e) => handleDragStart(e, event.slug)}
              onDragOver={(e) => handleDragOver(e, event.slug)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, event.slug)}
              onDragEnd={handleDragEnd}
              className={`rounded-xl border transition-colors ${
                dragOverSlug === event.slug
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-white/15 bg-white/[0.02] hover:border-white/25"
              } ${draggedSlug === event.slug ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-3 p-4 group">
                <span
                  className="shrink-0 cursor-grab active:cursor-grabbing text-white/40 hover:text-white/70 touch-none"
                  title="Перетащите для смены порядка"
                  onClick={(e) => e.preventDefault()}
                >
                  <GripVertical size={20} />
                </span>
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
                  {savingOrder && (
                    <Loader2 size={18} className="animate-spin text-white/50" />
                  )}
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
