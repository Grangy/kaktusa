"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { GripVertical, Plus, X, ZoomIn } from "lucide-react";
import { getOptimizedPhotoUrl } from "@/lib/photoUrl";
import { uploadImages } from "@/lib/uploadImage";

interface GalleryEditorProps {
  value: string[];
  onChange: (paths: string[]) => void;
  title?: string;
  emptyLabel?: string;
}

export function GalleryEditor({
  value,
  onChange,
  title = "Галерея",
  emptyLabel = "Добавьте фото (перетащите или загрузите)",
}: GalleryEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [lightboxPath, setLightboxPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [addPath, setAddPath] = useState("");

  const move = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= value.length || from === to) return;
      const next = [...value];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);
      onChange(next);
    },
    [value, onChange]
  );

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };
  const onDragLeave = () => setDragOverIndex(null);
  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null) return;
    move(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };
  const onDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addByPaths = () => {
    const paths = addPath
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (paths.length) {
      onChange([...value, ...paths]);
      setAddPath("");
    }
  };

  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const fileList = Array.from(files);
      const paths = await uploadImages(fileList);
      if (paths.length) onChange([...value, ...paths]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <section className="rounded-xl border border-white/15 bg-white/[0.02] p-6 overflow-hidden">
      <h2 className="font-display text-lg uppercase text-white/90 mb-4">{title}</h2>

      {/* Список с превью и drag-n-drop */}
      <p className="text-white/50 text-sm mb-3">
        Порядок карточек = приоритет рендера (первая — самая важная). Перетащите для изменения.
      </p>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6"
        onDragEnd={onDragEnd}
      >
        {value.map((path, index) => (
          <div
            key={`${path}-${index}`}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setDragOverIndex(index);
            }}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
            className={`group relative aspect-[4/5] rounded-lg overflow-hidden border-2 bg-black cursor-grab active:cursor-grabbing select-none transition-all duration-200 ${
              draggedIndex === index
                ? "border-[var(--accent)] opacity-40 scale-95 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)] z-10"
                : dragOverIndex === index
                  ? "border-[var(--accent)] border-dashed bg-[var(--accent)]/20 scale-[1.05] shadow-lg shadow-[var(--accent)]/20"
                  : "border-white/10 hover:border-white/25"
            }`}
          >
            {dragOverIndex === index && draggedIndex !== index && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                <span className="px-4 py-2 rounded-lg bg-[var(--accent)]/90 text-black text-sm font-semibold">
                  Сюда
                </span>
              </div>
            )}
            <span className="absolute top-2 left-2 z-10 w-6 h-6 flex items-center justify-center rounded bg-black/70 text-[10px] font-bold text-white">
              {index + 1}
            </span>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Image
                src={getOptimizedPhotoUrl(path)}
                alt=""
                fill
                className="object-cover"
                sizes="200px"
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
              <div className="flex items-center gap-1">
                <span
                  className="cursor-grab active:cursor-grabbing p-1.5 rounded bg-black/60 text-white/80 hover:text-white"
                  title="Перетащите для изменения порядка"
                >
                  <GripVertical size={16} />
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxPath(path)}
                  className="p-1.5 rounded bg-black/60 text-white/80 hover:text-white"
                  title="Увеличить"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1.5 rounded bg-red-500/90 text-white hover:bg-red-500"
                title="Удалить"
                aria-label="Удалить"
              >
                <X size={14} />
              </button>
            </div>
            <span className="absolute bottom-2 left-2 text-[10px] text-white/70 bg-black/60 px-2 py-0.5 rounded truncate max-w-[calc(100%-2rem)]">
              {path}
            </span>
          </div>
        ))}
      </div>

      {value.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg border border-dashed border-white/20 text-white/50 text-sm mb-6">
          {emptyLabel}
        </div>
      )}

      {/* Добавить: загрузка и пути */}
      <div className="flex flex-wrap items-end gap-3 min-w-0">
        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-colors rounded-lg shrink-0">
          <Plus size={16} />
          <span className="truncate max-w-[120px]">{uploading ? "Загрузка…" : "Загрузить файлы"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            onChange={uploadFiles}
            disabled={uploading}
          />
        </label>
        <div className="flex-1 min-w-0 flex gap-2 max-w-full">
          <input
            type="text"
            placeholder="/photos/имя.jpg"
            value={addPath}
            onChange={(e) => setAddPath(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addByPaths())}
            className="flex-1 min-w-0 px-3 py-2 bg-black border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--accent)] rounded-lg"
          />
          <button
            type="button"
            onClick={addByPaths}
            className="px-3 py-2 bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-sm font-semibold rounded-lg hover:bg-[var(--accent)]/30 shrink-0"
          >
            Добавить
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPath && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxPath(null)}
          aria-label="Закрыть"
        >
          <Image
            src={getOptimizedPhotoUrl(lightboxPath)}
            alt=""
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      )}
    </section>
  );
}
