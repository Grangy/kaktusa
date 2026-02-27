"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Event } from "@/types/data";
import { HeroImageEditor } from "./HeroImageEditor";
import { HeroVideoEditor } from "./HeroVideoEditor";
import { GalleryEditor } from "@/app/admin/main/GalleryEditor";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useToast } from "@/components/admin/ToastProvider";
import { AlertBanner } from "@/components/admin/AlertBanner";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Loader2, Trash2, GripVertical } from "lucide-react";

const defaultEvent: Partial<Event> = {
  type: "upcoming",
  title: "",
  slug: "",
  date: "",
  dateDisplay: "",
  time: "",
  location: "",
  locationShort: "",
  price: "",
  priceNote: "",
  heroImage: "",
  heroTagline: "",
  heroTitleTop: "",
  heroTitleBottom: "",
  metaTitle: "",
  metaDescription: "",
  artists: [],
  tickets: [],
  aboutParagraphs: [],
  venueTitle: "",
  venueAddress: "",
  venueCity: "",
  buyTicketUrl: "",
  age: "",
  dressCode: "",
  rules: "",
  gallery: [],
  logoScrolled: "",
  heroVideo: "",
};

function inputClass() {
  return "w-full px-4 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-[var(--accent)]";
}

export function EventEditForm({
  event,
  slug,
}: {
  event: Event | null;
  slug: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<Partial<Event>>(event ?? { ...defaultEvent, slug: slug === "new" ? "" : slug });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) setForm(event);
  }, [event]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const url = slug === "new" ? "/api/admin/events" : `/api/admin/events/${form.slug}`;
      const method = slug === "new" ? "POST" : "PUT";
      const body = {
        ...form,
        id: form.id || form.slug?.replace(/-/g, ""),
        artists: (form.artists ?? []).filter((s) => s.trim() !== ""),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || res.statusText);
      }
      await res.json();
      toast("success", slug === "new" ? "Мероприятие создано" : "Мероприятие сохранено");
      router.push("/admin/events");
      router.refresh();
      fetch("/api/admin/revalidate", { method: "POST" }).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка сохранения";
      setError(msg);
      toast("error", msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (slug === "new" || !form.slug) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/events/${form.slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка удаления");
      }
      toast("success", "Мероприятие удалено");
      router.push("/admin/events");
      router.refresh();
      fetch("/api/admin/revalidate", { method: "POST" }).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка удаления";
      toast("error", msg);
    } finally {
      setDeleting(false);
    }
  }

  const update = (patch: Partial<Event>) => setForm((f) => ({ ...f, ...patch }));

  const [paraDragged, setParaDragged] = useState<number | null>(null);
  const [paraDragOver, setParaDragOver] = useState<number | null>(null);
  const moveParagraph = useCallback(
    (from: number, to: number) => {
      const arr = form.aboutParagraphs ?? [];
      if (to < 0 || to >= arr.length || from === to) return;
      const next = [...arr];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);
      update({ aboutParagraphs: next });
    },
    [form.aboutParagraphs, update]
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && <AlertBanner variant="error" message={error} onDismiss={() => setError(null)} />}
      <div>
        <label className="block text-white/80 text-sm mb-1">Slug (URL)</label>
        <input
          value={form.slug ?? ""}
          onChange={(e) => update({ slug: e.target.value })}
          className={inputClass()}
          required
          disabled={slug !== "new"}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Тип</label>
        <select
          value={form.type ?? "upcoming"}
          onChange={(e) => update({ type: e.target.value as Event["type"] })}
          className={inputClass()}
        >
          <option value="upcoming">Предстоящее</option>
          <option value="past">Прошедшее</option>
        </select>
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Название</label>
        <input
          value={form.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          className={inputClass()}
          required
        />
      </div>
      <div className="rounded-lg border border-white/10 p-4 bg-black/20 space-y-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!((form.heroTitleTop ?? "").trim() || (form.heroTitleBottom ?? "").trim())}
            onChange={(e) => {
              if (!e.target.checked) update({ heroTitleTop: "", heroTitleBottom: "" });
              else {
                const t = (form.title ?? "").trim();
                const space = t.indexOf(" ");
                const top = space > 0 ? t.slice(0, space) : t;
                const bottom = space > 0 ? t.slice(space + 1) : "";
                update({ heroTitleTop: top, heroTitleBottom: bottom });
              }
            }}
            className="rounded border-white/30"
          />
          <span className="text-white/80 text-sm">Разбить на две строки в hero (как на главной: BLOOM / OF ENERGY)</span>
        </label>
        {((form.heroTitleTop ?? "").trim() || (form.heroTitleBottom ?? "").trim()) && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs mb-1">Верхняя строка</label>
              <input
                value={form.heroTitleTop ?? ""}
                onChange={(e) => update({ heroTitleTop: e.target.value })}
                className={inputClass()}
                placeholder="BLOOM"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Нижняя строка</label>
              <input
                value={form.heroTitleBottom ?? ""}
                onChange={(e) => update({ heroTitleBottom: e.target.value })}
                className={inputClass()}
                placeholder="OF ENERGY"
              />
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm mb-1">Дата (YYYY-MM-DD)</label>
          <input
            type="text"
            value={form.date ?? ""}
            onChange={(e) => update({ date: e.target.value })}
            className={inputClass()}
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-1">Дата (отображение)</label>
          <input
            value={form.dateDisplay ?? ""}
            onChange={(e) => update({ dateDisplay: e.target.value })}
            className={inputClass()}
          />
        </div>
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Время</label>
        <input
          value={form.time ?? ""}
          onChange={(e) => update({ time: e.target.value })}
          className={inputClass()}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Локация</label>
        <input
          value={form.location ?? ""}
          onChange={(e) => update({ location: e.target.value })}
          className={inputClass()}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Локация кратко</label>
        <input
          value={form.locationShort ?? ""}
          onChange={(e) => update({ locationShort: e.target.value })}
          className={inputClass()}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Цена</label>
        <input
          value={form.price ?? ""}
          onChange={(e) => update({ price: e.target.value })}
          className={inputClass()}
        />
      </div>
      {/* Hero: оформление текста и изображение (как на главной) */}
      <div className="rounded-xl border border-white/15 bg-white/[0.02] p-6 space-y-6">
        <h3 className="font-display text-lg uppercase text-white/90">Hero-блок</h3>
        <div>
          <label className="block text-white/80 text-sm mb-2">
            Текст под заголовком (жирный, курсив, списки — как на главной)
          </label>
          <RichTextEditor
            key={`heroTagline-${slug}-${form.title ?? ""}`}
            value={form.heroTagline ?? ""}
            onChange={(heroTagline) => update({ heroTagline })}
          />
        </div>
        <HeroImageEditor
          value={form.heroImage ?? ""}
          onChange={(heroImage) => update({ heroImage })}
          label="Hero-изображение"
        />
        <HeroImageEditor
          value={form.logoScrolled ?? ""}
          onChange={(logoScrolled) => update({ logoScrolled })}
          label="Логотип после hero (квадратный)"
          compact
        />
        <HeroVideoEditor
          value={form.heroVideo ?? ""}
          onChange={(heroVideo) => update({ heroVideo })}
        />
        <GalleryEditor
          title="Галерея мероприятия"
          value={form.gallery ?? []}
          onChange={(gallery) => update({ gallery })}
          emptyLabel="Добавьте фото для страницы мероприятия"
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Meta Title</label>
        <input
          value={form.metaTitle ?? ""}
          onChange={(e) => update({ metaTitle: e.target.value })}
          className={inputClass()}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Meta Description</label>
        <textarea
          value={form.metaDescription ?? ""}
          onChange={(e) => update({ metaDescription: e.target.value })}
          className={inputClass()}
          rows={2}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Артисты (по одному на строку)</label>
        <textarea
          value={(form.artists ?? []).join("\n")}
          onChange={(e) => update({ artists: e.target.value.split("\n") })}
          className={inputClass()}
          rows={6}
          placeholder="Введите имя артиста и нажмите Enter для новой строки"
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">О мероприятии (абзацы)</label>
        <p className="text-white/50 text-xs mb-2">Перетащите для изменения порядка</p>
        {(form.aboutParagraphs ?? []).map((p, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => {
              setParaDragged(i);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setParaDragOver(i);
            }}
            onDragLeave={() => setParaDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setParaDragOver(null);
              if (paraDragged !== null) {
                moveParagraph(paraDragged, i);
                setParaDragged(null);
              }
            }}
            onDragEnd={() => {
              setParaDragged(null);
              setParaDragOver(null);
            }}
            className={`mb-2 flex gap-2 cursor-grab active:cursor-grabbing select-none rounded p-1 -m-1 ${
              paraDragged === i ? "opacity-50" : paraDragOver === i ? "ring-1 ring-[var(--accent)] rounded" : ""
            }`}
          >
            <span className="shrink-0 mt-3 text-white/40" title="Перетащите">
              <GripVertical size={18} />
            </span>
            <textarea
              value={p}
              onChange={(e) => {
                const arr = [...(form.aboutParagraphs ?? [])];
                arr[i] = e.target.value;
                update({ aboutParagraphs: arr });
              }}
              className={`${inputClass()} flex-1 min-w-0`}
              rows={2}
            />
            <button
              type="button"
              onClick={() =>
                update({
                  aboutParagraphs: (form.aboutParagraphs ?? []).filter((_, j) => j !== i),
                })
              }
              className="shrink-0 px-2 text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update({ aboutParagraphs: [...(form.aboutParagraphs ?? []), ""] })
          }
          className="text-sm text-[var(--accent)] hover:underline"
        >
          + Абзац
        </button>
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Локация (заголовок)</label>
        <input
          value={form.venueTitle ?? ""}
          onChange={(e) => update({ venueTitle: e.target.value })}
          className={inputClass()}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Локация (адрес)</label>
        <input
          value={form.venueAddress ?? ""}
          onChange={(e) => update({ venueAddress: e.target.value })}
          className={inputClass()}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Локация (город)</label>
        <input
          value={form.venueCity ?? ""}
          onChange={(e) => update({ venueCity: e.target.value })}
          className={inputClass()}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Ссылка на покупку билета</label>
        <input
          value={form.buyTicketUrl ?? ""}
          onChange={(e) => update({ buyTicketUrl: e.target.value })}
          className={inputClass()}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Билеты</label>
        {(form.tickets ?? []).map((t, i) => (
          <div key={i} className="mb-2 grid grid-cols-2 gap-2 rounded border border-white/10 p-2">
            <input
              placeholder="id"
              value={t.id}
              onChange={(e) => {
                const arr = [...(form.tickets ?? [])];
                arr[i] = { ...arr[i], id: e.target.value };
                update({ tickets: arr });
              }}
              className={inputClass()}
            />
            <input
              placeholder="Название"
              value={t.name}
              onChange={(e) => {
                const arr = [...(form.tickets ?? [])];
                arr[i] = { ...arr[i], name: e.target.value };
                update({ tickets: arr });
              }}
              className={inputClass()}
            />
            <input
              placeholder="Цена"
              value={t.price}
              onChange={(e) => {
                const arr = [...(form.tickets ?? [])];
                arr[i] = { ...arr[i], price: e.target.value };
                update({ tickets: arr });
              }}
              className={inputClass()}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={t.earlyBird ?? false}
                onChange={(e) => {
                  const arr = [...(form.tickets ?? [])];
                  arr[i] = { ...arr[i], earlyBird: e.target.checked };
                  update({ tickets: arr });
                }}
              />
              Early Bird
            </label>
            <button
              type="button"
              onClick={() =>
                update({
                  tickets: (form.tickets ?? []).filter((_, j) => j !== i),
                })
              }
              className="col-span-2 text-red-400 text-sm hover:underline"
            >
              Удалить билет
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update({
              tickets: [...(form.tickets ?? []), { id: "", name: "", price: "" }],
            })
          }
          className="text-sm text-[var(--accent)] hover:underline"
        >
          + Билет
        </button>
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Возраст</label>
        <input
          value={form.age ?? ""}
          onChange={(e) => update({ age: e.target.value })}
          className={inputClass()}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Дресс-код</label>
        <input
          value={form.dressCode ?? ""}
          onChange={(e) => update({ dressCode: e.target.value })}
          className={inputClass()}
        />
      </div>
      <div>
        <label className="block text-white/80 text-sm mb-1">Правила</label>
        <input
          value={form.rules ?? ""}
          onChange={(e) => update({ rules: e.target.value })}
          className={inputClass()}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-black font-display text-sm font-semibold uppercase rounded-lg hover:opacity-90 disabled:opacity-50 min-w-[140px]"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : null}
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
          <Link
            href="/admin/events"
            className="px-6 py-3 rounded-lg border border-white/30 text-white font-display text-sm uppercase hover:bg-white/10 transition-colors"
          >
            Отмена
          </Link>
          {slug !== "new" && event && (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-red-500/50 text-red-400 font-display text-sm uppercase hover:bg-red-500/10 disabled:opacity-50 transition-colors"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Удалить
            </button>
          )}
        </div>
      </form>

      <ConfirmModal
        open={deleteConfirmOpen}
        title="Удалить мероприятие?"
        message={`Мероприятие «${form.title || form.slug}» будет удалено безвозвратно. Это действие нельзя отменить.`}
        confirmLabel="Удалить"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
