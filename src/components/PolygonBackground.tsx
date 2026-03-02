"use client";

/**
 * Единая фоновая подложка: тёмно-зелёный градиент.
 * Sticky (fixed) — не привязана к блокам, не двигается при скролле.
 */
export default function PolygonBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden
      style={{
        background:
          "linear-gradient(180deg, rgba(6, 22, 12, 0.98) 0%, rgba(8, 28, 16, 0.96) 30%, rgba(5, 18, 10, 0.98) 60%, rgba(3, 12, 7, 1) 100%)",
      }}
    />
  );
}
