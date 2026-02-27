import { cache } from "react";
import { prisma } from "@/lib/db";
import type { Event, MainContent, MetaContent } from "@/types/data";
import type { TicketOption } from "@/types/data";

function rowToEvent(row: {
  id: string;
  slug: string;
  type: string;
  title: string;
  date: string;
  dateDisplay: string;
  time: string | null;
  location: string;
  locationShort: string | null;
  price: string | null;
  priceNote: string | null;
  heroImage: string;
  heroTagline: string | null;
  heroTitleTop: string | null;
  heroTitleBottom: string | null;
  tag: string | null;
  tagStyle: string | null;
  metaTitle: string;
  metaDescription: string;
  artists: string;
  tickets: string;
  aboutParagraphs: string;
  venueTitle: string;
  venueAddress: string;
  venueCity: string;
  buyTicketUrl: string | null;
  age: string | null;
  dressCode: string | null;
  rules: string | null;
  subtitle: string | null;
  gallery?: string | null;
}): Event {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type as Event["type"],
    title: row.title,
    date: row.date,
    dateDisplay: row.dateDisplay,
    time: row.time ?? undefined,
    location: row.location,
    locationShort: row.locationShort ?? undefined,
    price: row.price ?? undefined,
    priceNote: row.priceNote ?? undefined,
    heroImage: row.heroImage,
    heroTagline: row.heroTagline ?? undefined,
    heroTitleTop: row.heroTitleTop ?? undefined,
    heroTitleBottom: row.heroTitleBottom ?? undefined,
    tag: row.tag ?? undefined,
    tagStyle: row.tagStyle ?? undefined,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    artists: JSON.parse(row.artists || "[]") as string[],
    tickets: JSON.parse(row.tickets || "[]") as TicketOption[],
    aboutParagraphs: JSON.parse(row.aboutParagraphs || "[]") as string[],
    venueTitle: row.venueTitle,
    venueAddress: row.venueAddress,
    venueCity: row.venueCity,
    buyTicketUrl: row.buyTicketUrl ?? undefined,
    age: row.age ?? undefined,
    dressCode: row.dressCode ?? undefined,
    rules: row.rules ?? undefined,
    subtitle: row.subtitle ?? undefined,
    gallery: row.gallery ? (JSON.parse(row.gallery) as string[]) : undefined,
  };
}

export async function getEvents(): Promise<Event[]> {
  const rows = await prisma.event.findMany({ orderBy: { date: "desc" } });
  return rows.map(rowToEvent);
}

export async function getEventBySlug(slug: string): Promise<Event | undefined> {
  const row = await prisma.event.findUnique({ where: { slug } });
  return row ? rowToEvent(row) : undefined;
}

const eventToUpsert = (e: Event) => ({
  id: e.id,
  slug: e.slug,
  type: e.type,
  title: e.title,
  date: e.date,
  dateDisplay: e.dateDisplay,
  time: e.time ?? null,
  location: e.location,
  locationShort: e.locationShort ?? null,
  price: e.price ?? null,
  priceNote: e.priceNote ?? null,
  heroImage: e.heroImage,
  heroTagline: e.heroTagline ?? null,
  heroTitleTop: e.heroTitleTop ?? null,
  heroTitleBottom: e.heroTitleBottom ?? null,
  tag: e.tag ?? null,
  tagStyle: e.tagStyle ?? null,
  metaTitle: e.metaTitle,
  metaDescription: e.metaDescription,
  artists: JSON.stringify(e.artists ?? []),
  tickets: JSON.stringify(e.tickets ?? []),
  aboutParagraphs: JSON.stringify(e.aboutParagraphs ?? []),
  venueTitle: e.venueTitle,
  venueAddress: e.venueAddress,
  venueCity: e.venueCity,
  buyTicketUrl: e.buyTicketUrl ?? null,
  age: e.age ?? null,
  dressCode: e.dressCode ?? null,
  rules: e.rules ?? null,
  subtitle: e.subtitle ?? null,
  gallery: e.gallery?.length ? JSON.stringify(e.gallery) : null,
});

export async function createEvent(event: Event): Promise<void> {
  await prisma.event.create({
    data: { ...eventToUpsert(event) },
  });
}

export async function updateEvent(slug: string, event: Event): Promise<void> {
  await prisma.event.update({
    where: { slug },
    data: eventToUpsert(event),
  });
}

export async function deleteEvent(slug: string): Promise<void> {
  await prisma.event.delete({ where: { slug } });
}

export const getMain = cache(async (): Promise<MainContent> => {
  const row = await prisma.main.findUnique({ where: { id: "main" } });
  if (!row) throw new Error("Main content not found");
  return {
    hero: JSON.parse(row.hero) as MainContent["hero"],
    about: JSON.parse(row.about) as MainContent["about"],
    gallery: JSON.parse(row.gallery) as MainContent["gallery"],
    reviews: JSON.parse(row.reviews) as MainContent["reviews"],
  };
});

export async function getMainSafe(): Promise<MainContent | null> {
  try {
    return await getMain();
  } catch {
    return null;
  }
}

export async function writeMain(main: MainContent): Promise<void> {
  await prisma.main.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      hero: JSON.stringify(main.hero),
      about: JSON.stringify(main.about),
      gallery: JSON.stringify(main.gallery),
      reviews: JSON.stringify(main.reviews),
    },
    update: {
      hero: JSON.stringify(main.hero),
      about: JSON.stringify(main.about),
      gallery: JSON.stringify(main.gallery),
      reviews: JSON.stringify(main.reviews),
    },
  });
}

export async function getMeta(): Promise<MetaContent> {
  const row = await prisma.meta.findUnique({ where: { id: "meta" } });
  if (!row) throw new Error("Meta not found");
  return {
    title: row.title,
    description: row.description,
    canonical: row.canonical ?? undefined,
  };
}

export async function writeMeta(meta: MetaContent): Promise<void> {
  await prisma.meta.upsert({
    where: { id: "meta" },
    create: {
      id: "meta",
      title: meta.title,
      description: meta.description,
      canonical: meta.canonical ?? null,
    },
    update: {
      title: meta.title,
      description: meta.description,
      canonical: meta.canonical ?? null,
    },
  });
}
