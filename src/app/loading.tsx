export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[300] h-0.5 bg-[var(--accent)]/20 overflow-hidden" aria-live="polite" aria-busy="true">
      <div className="h-full w-1/4 bg-[var(--accent)] animate-loading-bar" />
    </div>
  );
}
