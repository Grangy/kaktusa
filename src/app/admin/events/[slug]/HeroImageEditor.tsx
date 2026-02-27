"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, X, ZoomIn } from "lucide-react";
import { getOptimizedPhotoUrl } from "@/lib/photoUrl";
import { uploadImages } from "@/lib/uploadImage";

interface HeroImageEditorProps {
  value: string;
  onChange: (path: string) => void;
  label?: string;
  /** Компактный режим (для логотипов) */
  compact?: boolean;
}

export function HeroImageEditor({
  value,
  onChange,
  label = "Hero-изображение",
  compact = false,
}: HeroImageEditorProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pathInput, setPathInput] = useState("");

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const paths = await uploadImages([file]);
      if (paths[0]) onChange(paths[0]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function addByPath() {
    const path = pathInput.trim();
    if (path) {
      onChange(path.startsWith("/") ? path : `/${path}`);
      setPathInput("");
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4 overflow-hidden min-w-0">
      <h3 className="font-display text-xs uppercase text-white/80 mb-3 truncate">{label}</h3>
      {!compact && (
        <p className="text-white/50 text-xs mb-3 line-clamp-2">
          Загрузите файл или укажите путь к картинке (как в блоке галереи на главной).
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start min-w-0">
        {/* Превью */}
        <div className={`shrink-0 ${compact ? "w-16 sm:w-20" : "w-full sm:w-40"}`}>
          {value ? (
            <div className={`group relative rounded-lg overflow-hidden border-2 border-white/10 hover:border-white/25 bg-black transition-colors ${compact ? "aspect-square" : "aspect-[4/5]"}`}>
              <Image
                src={getOptimizedPhotoUrl(value)}
                alt=""
                fill
                className="object-cover"
                sizes="200px"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30"
                  title="Увеличить"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500"
                  title="Удалить"
                >
                  <X size={20} />
                </button>
              </div>
              <span className={`absolute bottom-2 left-2 right-2 text-white/70 bg-black/60 px-2 py-1 rounded truncate ${compact ? "text-[9px]" : "text-[10px]"}`}>
                {value}
              </span>
            </div>
          ) : (
            <div className={`rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/50 text-xs p-2 ${compact ? "aspect-square" : "aspect-[4/5]"}`}>
              Нет
            </div>
          )}
        </div>

        {/* Загрузка и путь */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
          <label className="cursor-pointer inline-flex items-center gap-2 w-full max-w-full px-3 py-2 bg-white/10 border border-white/20 text-white text-xs font-medium hover:bg-white/15 transition-colors rounded-lg shrink-0 overflow-hidden">
            <Plus size={16} className="shrink-0" />
            <span className="truncate">{uploading ? "Загрузка…" : "Загрузить файл"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={uploadFile}
              disabled={uploading}
            />
          </label>
          <div className="flex gap-2 min-w-0">
            <input
              type="text"
              placeholder="/photos/имя.jpg"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addByPath())}
              className="flex-1 min-w-0 px-3 py-2 bg-black/50 border border-white/20 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[var(--accent)] rounded-lg"
            />
            <button
              type="button"
              onClick={addByPath}
              className="px-3 py-2 bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-semibold rounded-lg hover:bg-[var(--accent)]/30 shrink-0"
            >
              Подставить
            </button>
          </div>
        </div>
      </div>

      {lightboxOpen && value && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          aria-label="Закрыть"
        >
          <Image
            src={getOptimizedPhotoUrl(value)}
            alt=""
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      )}
    </div>
  );
}
