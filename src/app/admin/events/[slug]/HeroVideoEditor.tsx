"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { uploadImages } from "@/lib/uploadImage";

const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi";

interface HeroVideoEditorProps {
  value: string;
  onChange: (path: string) => void;
}

/**
 * Hero-видео: если задано, на странице мероприятия в hero показывается видео вместо фото.
 */
export function HeroVideoEditor({ value, onChange }: HeroVideoEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [pathInput, setPathInput] = useState("");

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const paths = await uploadImages([file]); // API принимает и видео, оптимизация только для изображений
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

  const isVideo = /\.(mp4|webm|mov|avi)(\?|$)/i.test(value);

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4 overflow-hidden min-w-0">
      <h3 className="font-display text-xs uppercase text-white/80 mb-3 truncate">Hero-видео</h3>
      <p className="text-white/50 text-xs mb-3 line-clamp-2">
        Если задано — при загрузке страницы в hero показывается видео вместо фото. MP4, WebM, MOV, AVI до 150 MB.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-start min-w-0">
        <div className="shrink-0 w-full sm:w-40">
          {value ? (
            <div className="group relative rounded-lg overflow-hidden border-2 border-white/10 hover:border-white/25 bg-black aspect-video">
              {isVideo ? (
                <video
                  src={value}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs">
                  Не видео
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500"
                  title="Удалить"
                >
                  <X size={20} />
                </button>
              </div>
              <span className="absolute bottom-2 left-2 right-2 text-white/70 bg-black/60 px-2 py-1 rounded truncate text-[10px]">
                {value}
              </span>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-white/20 aspect-video flex flex-col items-center justify-center text-white/50 text-xs p-2">
              Нет
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
          <label className="cursor-pointer inline-flex items-center gap-2 w-full max-w-full px-3 py-2 bg-white/10 border border-white/20 text-white text-xs font-medium hover:bg-white/15 transition-colors rounded-lg shrink-0 overflow-hidden">
            <Plus size={16} className="shrink-0" />
            <span className="truncate">{uploading ? "Загрузка…" : "Загрузить видео"}</span>
            <input
              type="file"
              accept={VIDEO_ACCEPT}
              className="sr-only"
              onChange={uploadFile}
              disabled={uploading}
            />
          </label>
          <div className="flex gap-2 min-w-0">
            <input
              type="text"
              placeholder="/photos/имя.mp4"
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
    </div>
  );
}
