/**
 * Статический прелоадер в начальном HTML — показывается до гидратации React.
 * Лого прелоадится через layout, поэтому здесь он уже в кэше.
 */
export default function PreloaderShell({ logo = "/logo.png" }: { logo?: string }) {
  return (
    <div
      id="preloader-shell"
      className="fixed inset-0 z-[199] flex items-center justify-center bg-black"
      aria-hidden="true"
    >
      <div className="relative w-28 h-28 md:w-36 md:h-36">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
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
