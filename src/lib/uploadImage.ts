/**
 * Загрузка изображений с оптимизацией и корректной обработкой ошибок.
 * — Оптимизация больших файлов перед отправкой
 * — Обработка 413 (Request Entity Too Large) и HTML-ответов от nginx
 */

import { optimizeImage } from "./imageOptimize";

async function parseErrorResponse(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const data = JSON.parse(text) as { error?: string };
    if (data?.error) return data.error;
  } catch {
    // Сервер вернул HTML (например, страница ошибки nginx)
  }
  if (res.status === 413) {
    return "Файл слишком большой (413). Лимит: 10 MB — изображения, 150 MB — видео. Проверьте nginx client_max_body_size и next.config serverActions.bodySizeLimit.";
  }
  if (res.status === 401) return "Нет доступа. Войдите в админку.";
  if (res.status === 400) return text || "Неверный формат файла.";
  return `Ошибка загрузки (${res.status}). ${text.slice(0, 100)}`;
}

export interface UploadResult {
  paths: string[];
  ok: true;
}

export async function uploadImages(
  files: File[],
  options?: { optimize?: boolean }
): Promise<string[]> {
  const optimize = options?.optimize !== false;
  const processed: File[] = [];
  for (const f of files) {
    processed.push(optimize ? await optimizeImage(f) : f);
  }
  const form = new FormData();
  for (const f of processed) {
    form.append("files", f);
  }
  if (processed.length === 1) {
    form.delete("files");
    form.append("file", processed[0]);
  }
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
  const data = (await res.json()) as UploadResult | { error?: string };
  if ("error" in data && data.error) {
    throw new Error(data.error);
  }
  if ("paths" in data && Array.isArray(data.paths) && data.paths.length) {
    return data.paths;
  }
  throw new Error("Сервер не вернул пути к файлам");
}
