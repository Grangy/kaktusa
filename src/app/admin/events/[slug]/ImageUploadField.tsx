"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadImages } from "@/lib/uploadImage";

interface ImageUploadFieldProps {
  value: string;
  onChange: (path: string) => void;
  label: string;
  placeholder?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label,
  placeholder = "/photos/имя.jpg",
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
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

  const inputClass =
    "w-full px-4 py-2.5 bg-black/50 border border-white/20 text-white rounded-lg focus:outline-none focus:border-[var(--accent)] placeholder:text-white/40";

  return (
    <div>
      <label className="block text-white/80 text-sm mb-1">{label}</label>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
          <label className="shrink-0 cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-colors rounded-lg">
            {uploading ? "…" : "Загрузить"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={onFileSelect}
              disabled={uploading}
            />
          </label>
        </div>
        {value && (
          <div className="shrink-0 w-24 h-24 relative rounded-lg overflow-hidden border border-white/20 bg-black/50">
            <Image
              src={value}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
