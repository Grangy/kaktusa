import PageWithPreloader from "@/components/PageWithPreloader";
import { getMain, getEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  let main = null;
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  try {
    [main, events] = await Promise.all([getMain(), getEvents()]);
  } catch {
    // БД недоступна — компоненты используют запасные данные
  }
  return <PageWithPreloader main={main} events={events} />;
}
