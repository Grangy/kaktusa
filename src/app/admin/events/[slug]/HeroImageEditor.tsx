"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, X, ZoomIn } from "lucide-react";

interface HeroImageEditorProps {
  value: string;
  onChange: (path: string) => void;
  label?: string;
}

export function HeroImageEditor({
  value,
  onChange,
  label = "Hero-изображение",
}: HeroImageEditorProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pathInput, setPathInput] = useState("");

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (data.paths?.[0]) onChange(data.paths[0]);
    } catch (err) {
      console.error(err);
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
    <div className="rounded-xl border border-white/15 bg-white/[0.02] p-6">
      <h3 className="font-display text-sm uppercase text-white/90 mb-4">{label}</h3>
      <p className="text-white/50 text-xs mb-4">
        Загрузите файл или укажите путь к картинке (как в блоке галереи на главной).
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Превью */}
        <div className="w-full sm:w-48 shrink-0">
          {value ? (
            <div className="group relative aspect-[4/5] rounded-lg overflow-hidden border-2 border-white/10 hover:border-white/25 bg-black transition-colors">
              <Image
                src={value}
                alt=""
                fill
                className="object-cover"
                sizes="200px"
                unoptimized
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
              <span className="absolute bottom-2 left-2 right-2 text-[10px] text-white/70 bg-black/60 px-2 py-1 rounded truncate">
                {value}
              </span>
            </div>
          ) : (
            <div className="aspect-[4/5] rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/50 text-sm p-4">
              Нет изображения
            </div>
          )}
        </div>

        {/* Загрузка и путь */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <label className="cursor-pointer inline-flex items-center gap-2 w-fit px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-colors rounded-lg">
            <Plus size={18} />
            {uploading ? "Загрузка…" : "Загрузить файл"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={uploadFile}
              disabled={uploading}
            />
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="/photos/имя.jpg"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addByPath())}
              className="flex-1 px-3 py-2 bg-black/50 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--accent)] rounded-lg"
            />
            <button
              type="button"
              onClick={addByPath}
              className="px-4 py-2 bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-sm font-semibold rounded-lg hover:bg-[var(--accent)]/30 shrink-0"
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
            src={value}
            alt=""
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain"
            unoptimized
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      )}
    </div>
  );
}
