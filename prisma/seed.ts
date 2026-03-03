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

/** Мета только в БД; при первом создании — дефолты. Редактирование через админку. */
const DEFAULT_META = {
  title: "?КАКТУСА — Электронные ивенты с особым смыслом в Крыму",
  description:
    "?КАКТУСА — проект электронных ивентов с особым смыслом и звучанием в уникальных локациях Крыма. Объединяем людей с изысканным музыкальным вкусом.",
  canonical: "https://kaktusa.ru" as string | null,
  googleFontUrl: null as string | null,
  fontFamily: null as string | null,
};

function eventToCreate(e: SeedEvent) {
  return {
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
  };
}

/**
 * Production: только добавляем новые события. Main/Meta создаём только если нет (не перезаписываем).
 * Локально: events + main из JSON; Meta только создаём если нет (редактирование только из БД/админки).
 */
const isProduction = process.env.NODE_ENV === "production";

async function main() {
  const events = readJson<SeedEvent[]>("events.json");
  let added = 0;
  for (const e of events) {
    const existing = await prisma.event.findUnique({ where: { slug: e.slug } });
    if (existing) continue;
    await prisma.event.create({ data: eventToCreate(e) });
    added++;
  }
  if (added > 0) {
    console.log(`Seed: добавлено ${added} новых мероприятий.`);
  }

  const mainData = readJson<SeedMain>("main.json");

  if (isProduction) {
    const existingMain = await prisma.main.findUnique({ where: { id: "main" } });
    if (!existingMain) {
      await prisma.main.create({
        data: {
          id: "main",
          hero: JSON.stringify(mainData.hero),
          about: JSON.stringify(mainData.about),
          gallery: JSON.stringify(mainData.gallery),
          reviews: JSON.stringify(mainData.reviews),
        },
      });
      console.log("Seed: Main создан (новый сервер).");
    }
    const existingMeta = await prisma.meta.findUnique({ where: { id: "meta" } });
    if (!existingMeta) {
      await prisma.meta.create({
        data: {
          id: "meta",
          title: DEFAULT_META.title,
          description: DEFAULT_META.description,
          canonical: DEFAULT_META.canonical,
          googleFontUrl: DEFAULT_META.googleFontUrl,
          fontFamily: DEFAULT_META.fontFamily,
        },
      });
      console.log("Seed: Meta создана (новый сервер).");
    }
    const existingChat = await prisma.chatSettings.findUnique({ where: { id: "chat" } });
    if (!existingChat) {
      await prisma.chatSettings.create({
        data: {
          id: "chat",
          enabled: false,
          botToken: null,
          telegramChatId: null,
          workStartMsk: "09:00",
          workEndMsk: "21:00",
          chatMode: "telegram",
          geminiPrompt: null,
          geminiApiKeys: null,
          welcomeMessage: null,
        },
      });
      console.log("Seed: ChatSettings созданы.");
    }
    console.log("Seed done. (production: Main/Meta не перезаписаны)");
    return;
  }

  // Локально: upsert Main из JSON; Meta только создаём если нет
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

  const existingMeta = await prisma.meta.findUnique({ where: { id: "meta" } });
  if (!existingMeta) {
    await prisma.meta.create({
      data: {
        id: "meta",
        title: DEFAULT_META.title,
        description: DEFAULT_META.description,
        canonical: DEFAULT_META.canonical,
        googleFontUrl: DEFAULT_META.googleFontUrl,
        fontFamily: DEFAULT_META.fontFamily,
      },
    });
    console.log("Seed: Meta создана (далее редактируйте в админке).");
  }

  const existingChat = await prisma.chatSettings.findUnique({ where: { id: "chat" } });
  if (!existingChat) {
    await prisma.chatSettings.create({
      data: {
        id: "chat",
        enabled: false,
        botToken: null,
        telegramChatId: null,
        workStartMsk: "09:00",
        workEndMsk: "21:00",
        chatMode: "telegram",
        geminiPrompt: null,
        geminiApiKeys: null,
        welcomeMessage: null,
      },
    });
    console.log("Seed: ChatSettings созданы.");
  }

  console.log("Seed done.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
