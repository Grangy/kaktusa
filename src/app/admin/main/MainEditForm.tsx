"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { MainContent } from "@/types/data";
import { GalleryEditor } from "./GalleryEditor";
import { HeroImageEditor } from "@/app/admin/events/[slug]/HeroImageEditor";
import { useToast } from "@/components/admin/ToastProvider";
import { AlertBanner } from "@/components/admin/AlertBanner";
import { Loader2, GripVertical } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 bg-black/50 border border-white/20 text-white rounded-lg focus:outline-none focus:border-[var(--accent)] placeholder:text-white/40";

const sectionCard =
  "rounded-xl border border-white/15 bg-white/[0.02] p-6";

export function MainEditForm({ initial }: { initial: MainContent }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<MainContent>(() => ({
    ...initial,
    hero: {
      ...initial.hero,
      logoHero: initial.hero?.logoHero ?? "/new-logo.png",
      logoScrolled: initial.hero?.logoScrolled ?? "/logo.png",
    },
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<MainContent>) => {
    setForm((f) => ({ ...f, ...patch }));
  };

  const updateHero = (patch: Partial<MainContent["hero"]>) => {
    setForm((f) => ({ ...f, hero: { ...f.hero, ...patch } }));
  };
  const updateAbout = (patch: Partial<MainContent["about"]>) => {
    setForm((f) => ({ ...f, about: { ...f.about, ...patch } }));
  };
  const updateGallery = (patch: Partial<MainContent["gallery"]>) => {
    setForm((f) => ({ ...f, gallery: { ...f.gallery, ...patch } }));
  };

  const [reviewDragged, setReviewDragged] = useState<number | null>(null);
  const [reviewDragOver, setReviewDragOver] = useState<number | null>(null);
  const moveReview = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= form.reviews.length || from === to) return;
      const next = [...form.reviews];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);
      update({ reviews: next });
    },
    [form.reviews, update]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/main", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка сохранения");
      toast("success", "Главная страница сохранена");
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

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {error && (
        <AlertBanner variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      <section className={sectionCard}>
        <h2 className="font-display text-lg uppercase text-white/90 mb-6">Hero</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-white/60 text-sm mb-1">Заголовок (верх)</label>
            <input
              value={form.hero.titleTop}
              onChange={(e) => updateHero({ titleTop: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Заголовок (низ)</label>
            <input
              value={form.hero.titleBottom}
              onChange={(e) => updateHero({ titleBottom: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Дата</label>
            <input
              value={form.hero.heroDate}
              onChange={(e) => updateHero({ heroDate: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Локация (рус)</label>
            <input
              value={form.hero.heroVenue}
              onChange={(e) => updateHero({ heroVenue: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-white/60 text-sm mb-1">Локация (англ)</label>
            <input
              value={form.hero.heroVenueEn}
              onChange={(e) => updateHero({ heroVenueEn: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <HeroImageEditor
            value={form.hero.logoHero ?? "/new-logo.png"}
            onChange={(logoHero) => updateHero({ logoHero })}
            label="Логотип в hero (до скролла)"
            compact
          />
          <HeroImageEditor
            value={form.hero.logoScrolled ?? "/logo.png"}
            onChange={(logoScrolled) => updateHero({ logoScrolled })}
            label="Логотип после hero (квадратный)"
            compact
          />
        </div>
        <div className="mt-6">
          <GalleryEditor
            title="Фото ПК (десктоп, смена по таймеру)"
            value={form.hero.pcImages ?? []}
            onChange={(pcImages) => updateHero({ pcImages })}
            emptyLabel="Добавьте пути к фото или загрузите файлы"
          />
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="font-display text-lg uppercase text-white/90 mb-6">О проекте</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Заголовок</label>
            <input
              value={form.about.heading}
              onChange={(e) => updateAbout({ heading: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Текст (абзацы)</label>
            {form.about.lines.map((line, i) => (
              <div key={i} className="mb-2">
                <textarea
                  value={line}
                  onChange={(e) => {
                    const arr = [...form.about.lines];
                    arr[i] = e.target.value;
                    updateAbout({ lines: arr });
                  }}
                  className={inputClass}
                  rows={2}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateAbout({ lines: [...form.about.lines, ""] })}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              + Абзац
            </button>
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Ссылка кнопки</label>
            <input
              value={form.about.ctaHref}
              onChange={(e) => updateAbout({ ctaHref: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <GalleryEditor
        title="Галерея"
        value={form.gallery.photos ?? []}
        onChange={(photos) => updateGallery({ photos })}
        emptyLabel="Добавьте фото: перетащите порядок, загрузите или вставьте пути"
      />

      <section className={sectionCard}>
        <h2 className="font-display text-lg uppercase text-white/90 mb-6">Отзывы</h2>
        <p className="text-white/50 text-sm mb-4">
          Отзывы показываются бесконечной каруселью на главной. Перетащите для изменения порядка (приоритета).
        </p>
        <div className="space-y-4">
          {form.reviews.map((r, i) => (
            <div
              key={r.id}
              draggable
              onDragStart={(e) => {
                setReviewDragged(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setReviewDragOver(i);
              }}
              onDragLeave={() => setReviewDragOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setReviewDragOver(null);
                if (reviewDragged !== null) {
                  moveReview(reviewDragged, i);
                  setReviewDragged(null);
                }
              }}
              onDragEnd={() => {
                setReviewDragged(null);
                setReviewDragOver(null);
              }}
              className={`rounded-lg border border-white/10 p-4 bg-black/20 flex gap-3 cursor-grab active:cursor-grabbing select-none ${
                reviewDragged === i ? "opacity-50" : reviewDragOver === i ? "border-[var(--accent)] bg-[var(--accent)]/10" : ""
              }`}
            >
              <span className="shrink-0 mt-1 text-white/40 cursor-grab" title="Перетащите для изменения порядка">
                <GripVertical size={18} />
              </span>
              <div className="flex-1 space-y-2">
                <input
                  placeholder="Автор"
                  value={r.author}
                  onChange={(e) => {
                    const arr = [...form.reviews];
                    arr[i] = { ...arr[i], author: e.target.value };
                    update({ reviews: arr });
                  }}
                  className={inputClass}
                />
                <textarea
                  placeholder="Текст отзыва"
                  value={r.text}
                  onChange={(e) => {
                    const arr = [...form.reviews];
                    arr[i] = { ...arr[i], text: e.target.value };
                    update({ reviews: arr });
                  }}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  update({
                    reviews: form.reviews.filter((_, j) => j !== i),
                  })
                }
                className="shrink-0 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                title="Удалить отзыв"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const maxId = form.reviews.length ? Math.max(...form.reviews.map((r) => r.id)) : 0;
            update({
              reviews: [...form.reviews, { id: maxId + 1, text: "", author: "" }],
            });
          }}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/15 transition-colors"
        >
          + Добавить отзыв
        </button>
      </section>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-black font-display text-sm font-semibold uppercase rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity min-w-[140px]"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : null}
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
