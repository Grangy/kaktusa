/**
 * Оптимизация изображения в браузере перед загрузкой:
 * — ресайз до max 1920px по большей стороне
 * — сжатие JPEG/WebP до quality 0.82
 * — без внешних зависимостей (Canvas API)
 */

const MAX_DIM = 1920;
const JPEG_QUALITY = 0.82;
const MIN_SIZE_TO_OPTIMIZE = 500 * 1024; // 500 KB — ниже не трогаем

export function shouldOptimize(file: File): boolean {
  return file.size > MIN_SIZE_TO_OPTIMIZE && /^image\/(jpeg|png|webp|gif)$/i.test(file.type);
}

export async function optimizeImage(file: File): Promise<File> {
  if (!shouldOptimize(file)) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      let w = width;
      let h = height;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width >= height) {
          w = MAX_DIM;
          h = Math.round((height * MAX_DIM) / width);
        } else {
          h = MAX_DIM;
          w = Math.round((width * MAX_DIM) / height);
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      // JPEG даёт лучшее сжатие для фото; PNG сохраняем только если нужна прозрачность
      const useJpeg = !/^image\/png$/i.test(file.type);
      const mime = useJpeg ? "image/jpeg" : "image/png";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          // Если после сжатия файл больше — оставляем оригинал
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }
          const ext = useJpeg ? ".jpg" : ".png";
          const name = file.name.replace(/\.[^.]+$/, "") + ext;
          resolve(new File([blob], name, { type: mime }));
        },
        mime,
        useJpeg ? JPEG_QUALITY : 0.95
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}
