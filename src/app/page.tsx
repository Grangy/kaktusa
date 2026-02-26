import { Suspense } from "react";
import PageWithPreloader from "@/components/PageWithPreloader";
import PreloaderShell from "@/components/PreloaderShell";
import { getMain, getEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

async function HomeContent() {
  let main = null;
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  try {
    [main, events] = await Promise.all([getMain(), getEvents()]);
  } catch {
    // БД недоступна — компоненты используют запасные данные
  }
  const logo = main?.hero?.logoScrolled ?? "/logo.png";
  return (
    <>
      {logo !== "/logo.png" && (
        <link rel="preload" href={logo} as="image" fetchPriority="high" />
      )}
      <PageWithPreloader main={main} events={events} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<PreloaderShell logo="/logo.png" />}>
      <HomeContent />
    </Suspense>
  );
}
