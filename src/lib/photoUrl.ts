/**
 * Конвертирует путь /photos/xxx в /api/photos/xxx для работы Image Optimization.
 * Next.js оптимизатор фетчит источник; /api/photos/ отдаёт файл с того же сервера.
 */
export function getOptimizedPhotoUrl(path: string): string {
  if (path.startsWith("/photos/")) {
    return "/api/photos" + path.slice(7);
  }
  return path;
}
