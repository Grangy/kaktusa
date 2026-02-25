"use client";

import { useSyncExternalStore } from "react";

export function useIsMobile() {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia("(max-width: 767px)");
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  );
}
