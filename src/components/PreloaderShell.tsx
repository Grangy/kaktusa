"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

interface PreloaderShellProps {
  preloaderLogo: string;
}

/**
 * Прелоадер в первых байтах HTML. Класс preloader-done выставляется по pathname
 * на сервере и клиенте одинаково — без гидрации.
 */
export default function PreloaderShell({ preloaderLogo }: PreloaderShellProps) {
  const pathname = usePathname();
  const hideOnNonHome = pathname !== "/";

  return (
    <div
      id="preloader-shell"
      aria-hidden="true"
      className={hideOnNonHome ? "preloader-done" : undefined}
    >
      <Image
        src={preloaderLogo}
        alt=""
        width={96}
        height={96}
        priority
        style={{ width: "7rem", height: "7rem", objectFit: "contain" }}
      />
    </div>
  );
}
