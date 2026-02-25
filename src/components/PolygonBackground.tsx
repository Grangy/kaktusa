"use client";

/**
 * Глобальный полигональный декор фона для всего сайта.
 * Fixed, покрывает viewport, не блокирует pointer-events.
 */
export default function PolygonBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="global-poly-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(74,222,128,0.16)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="global-poly-2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(74,222,128,0.14)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="global-poly-3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="rgba(74,222,128,0.1)" />
            <stop offset="50%" stopColor="rgba(74,222,128,0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="global-poly-4" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(74,222,128,0.1)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* Левый верхний полигон */}
        <polygon
          points="0,0 600,0 400,350 0,200"
          fill="url(#global-poly-1)"
        />
        {/* Правый нижний полигон */}
        <polygon
          points="1920,1080 1300,1080 1500,700 1920,850"
          fill="url(#global-poly-2)"
        />
        {/* Центральный полигон сверху */}
        <polygon
          points="600,100 1320,80 1200,400 720,450 200,350"
          fill="url(#global-poly-3)"
        />
        {/* Правый боковой полигон */}
        <polygon
          points="1600,200 1920,300 1920,800 1400,700"
          fill="url(#global-poly-4)"
        />
        {/* Контурные полигоны для глубины */}
        <polygon
          points="400,600 900,500 1100,700 600,900 200,750"
          fill="none"
          stroke="rgba(74,222,128,0.15)"
          strokeWidth="1.5"
        />
        <polygon
          points="100,500 500,400 700,600 400,800 0,700"
          fill="none"
          stroke="rgba(74,222,128,0.12)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
