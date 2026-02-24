"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function NProgressBar() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      setShow(true);
      setProgress(30);
      timeouts.push(setTimeout(() => setProgress(70), 30));
      timeouts.push(
        setTimeout(() => {
          setProgress(100);
          timeouts.push(setTimeout(() => { setShow(false); setProgress(0); }, 80));
        }, 80)
      );
    };
    timeouts.push(setTimeout(run, 0));
    return () => timeouts.forEach(clearTimeout);
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[400] h-0.5 bg-[var(--accent)] transition-all duration-200 ease-out"
      style={{ transform: `scaleX(${progress / 100})`, transformOrigin: "left" }}
      aria-hidden
    />
  );
}
