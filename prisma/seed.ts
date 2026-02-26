import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const dataDir = path.join(process.cwd(), "data");

function readJson<T>(filename: string): T {
  const raw = fs.readFileSync(path.join(dataDir, filename), "utf-8");
  return JSON.parse(raw) as T;
}

interface SeedEvent {
  id: string;
  slug: string;
  type: string;
  title: string;
  date: string;
  dateDisplay: string;
  time?: string;
  location: string;
  locationShort?: string;
  price?: string;
  priceNote?: string;
  heroImage: string;
  tag?: string;
  tagStyle?: string;
  metaTitle: string;
  metaDescription: string;
  artists?: string[];
  tickets?: unknown[];
  aboutParagraphs?: string[];
  venueTitle: string;
  venueAddress: string;
  venueCity: string;
  buyTicketUrl?: string;
  age?: string;
  dressCode?: string;
  rules?: string;
  subtitle?: string;
  gallery?: string[];
}

interface SeedMain {
  hero: Record<string, unknown>;
  about: Record<string, unknown>;
  gallery: Record<string, unknown>;
  reviews: unknown[];
}

interface SeedMeta {
  title: string;
  description: string;
  canonical?: string;
}

async function main() {
  const events = readJson<SeedEvent[]>("events.json");
  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      create: {
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
        heroTagline: null,
        heroTitleTop: null,
        heroTitleBottom: null,
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
      },
      update: {
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
        heroTagline: null,
        heroTitleTop: null,
        heroTitleBottom: null,
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
      },
    });
  }

  const mainData = readJson<SeedMain>("main.json");
  await prisma.main.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      hero: JSON.stringify(mainData.hero),
      about: JSON.stringify(mainData.about),
      gallery: JSON.stringify(mainData.gallery),
      reviews: JSON.stringify(mainData.reviews),
    },
    update: {
      hero: JSON.stringify(mainData.hero),
      about: JSON.stringify(mainData.about),
      gallery: JSON.stringify(mainData.gallery),
      reviews: JSON.stringify(mainData.reviews),
    },
  });

  const metaData = readJson<SeedMeta>("meta.json");
  await prisma.meta.upsert({
    where: { id: "meta" },
    create: {
      id: "meta",
      title: metaData.title,
      description: metaData.description,
      canonical: metaData.canonical ?? null,
    },
    update: {
      title: metaData.title,
      description: metaData.description,
      canonical: metaData.canonical ?? null,
    },
  });

  console.log("Seed done.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
