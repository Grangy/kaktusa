import type { MetadataRoute } from "next";
import { getEvents } from "@/lib/data";

const BASE = "https://kaktusa.ru";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  try {
    events = await getEvents();
  } catch {
    // БД недоступна при сборке — только главная
  }

  const eventUrls: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${BASE}/events/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: e.type === "upcoming" ? 0.9 : 0.6,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    ...eventUrls,
  ];
}
