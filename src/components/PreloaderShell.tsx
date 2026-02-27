/**
 * Статический прелоадер в начальном HTML — показывается до гидратации React.
 * Лого прелоадится через layout, поэтому здесь он уже в кэше.
 * Для /logo.png используем облегчённую версию logo-preloader.png.
 */
function getPreloaderLogo(logo: string): string {
  return logo === "/logo.png" ? "/logo-preloader.png" : logo;
}

export default function PreloaderShell({ logo = "/logo.png" }: { logo?: string }) {
  const src = getPreloaderLogo(logo);
  return (
    <div
      id="preloader-shell"
      className="fixed inset-0 z-[199] flex items-center justify-center bg-black"
      aria-hidden="true"
    >
      <div className="relative w-28 h-28 md:w-36 md:h-36">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={144}
          height={144}
          className="w-full h-full object-contain"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
