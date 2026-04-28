import { cache } from "react";
import { prisma } from "@/lib/db";
import type { Event, MainContent, MetaContent, ChatSettingsContent, ChatMessageItem, PaymentSettingsContent } from "@/types/data";
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
  buyTicketDisabled: boolean;
  testPaymentEnabled: boolean;
  age: string | null;
  dressCode: string | null;
  rules: string | null;
  subtitle: string | null;
  gallery?: string | null;
  logoScrolled?: string | null;
  heroVideo?: string | null;
  sortOrder?: number | null;
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
    buyTicketDisabled: row.buyTicketDisabled,
    testPaymentEnabled: row.testPaymentEnabled,
    age: row.age ?? undefined,
    dressCode: row.dressCode ?? undefined,
    rules: row.rules ?? undefined,
    subtitle: row.subtitle ?? undefined,
    gallery: row.gallery ? (JSON.parse(row.gallery) as string[]) : undefined,
    logoScrolled: row.logoScrolled ?? undefined,
    heroVideo: row.heroVideo ?? undefined,
    sortOrder: row.sortOrder ?? undefined,
  };
}

export async function getEvents(): Promise<Event[]> {
  const rows = await prisma.event.findMany();
  const events = rows.map(rowToEvent);
  events.sort((a, b) => {
    const aOrder = a.sortOrder ?? 1e9;
    const bOrder = b.sortOrder ?? 1e9;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return b.date.localeCompare(a.date);
  });
  return events;
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
  buyTicketDisabled: e.buyTicketDisabled ?? false,
  testPaymentEnabled: e.testPaymentEnabled ?? false,
  age: e.age ?? null,
  dressCode: e.dressCode ?? null,
  rules: e.rules ?? null,
  subtitle: e.subtitle ?? null,
  gallery: e.gallery?.length ? JSON.stringify(e.gallery) : null,
  logoScrolled: e.logoScrolled ?? null,
  heroVideo: e.heroVideo ?? null,
  sortOrder: e.sortOrder ?? null,
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

export async function updateEventsOrder(slugs: string[]): Promise<void> {
  await prisma.$transaction(
    slugs.map((slug, index) =>
      prisma.event.update({ where: { slug }, data: { sortOrder: index } })
    )
  );
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
    googleFontUrl: row.googleFontUrl ?? undefined,
    fontFamily: row.fontFamily ?? undefined,
  };
}

export async function getMetaSafe(): Promise<MetaContent | null> {
  try {
    return await getMeta();
  } catch {
    return null;
  }
}

export async function writeMeta(meta: MetaContent): Promise<void> {
  await prisma.meta.upsert({
    where: { id: "meta" },
    create: {
      id: "meta",
      title: meta.title,
      description: meta.description,
      canonical: meta.canonical ?? null,
      googleFontUrl: meta.googleFontUrl ?? null,
      fontFamily: meta.fontFamily ?? null,
    },
    update: {
      title: meta.title,
      description: meta.description,
      canonical: meta.canonical ?? null,
      googleFontUrl: meta.googleFontUrl ?? null,
      fontFamily: meta.fontFamily ?? null,
    },
  });
}

// ——— Chat ———

export async function getChatSettings(): Promise<ChatSettingsContent> {
  const row = await prisma.chatSettings.findUnique({ where: { id: "chat" } });
  if (!row) {
    return {
      enabled: false,
      botToken: null,
      telegramChatId: null,
      workStartMsk: "09:00",
      workEndMsk: "21:00",
      chatMode: "telegram",
      geminiPrompt: null,
      geminiApiKeys: null,
      welcomeMessage: null,
    };
  }
  return {
    enabled: row.enabled,
    botToken: row.botToken ?? null,
    telegramChatId: row.telegramChatId ?? null,
    workStartMsk: row.workStartMsk ?? null,
    workEndMsk: row.workEndMsk ?? null,
    chatMode: (row.chatMode as ChatSettingsContent["chatMode"]) ?? "telegram",
    geminiPrompt: row.geminiPrompt ?? null,
    geminiApiKeys: row.geminiApiKeys ?? null,
    welcomeMessage: row.welcomeMessage ?? null,
  };
}

export async function getChatSettingsSafe(): Promise<ChatSettingsContent | null> {
  try {
    return await getChatSettings();
  } catch {
    return null;
  }
}

export async function writeChatSettings(s: ChatSettingsContent): Promise<void> {
  await prisma.chatSettings.upsert({
    where: { id: "chat" },
    create: {
      id: "chat",
      enabled: s.enabled,
      botToken: s.botToken ?? null,
      telegramChatId: s.telegramChatId ?? null,
      workStartMsk: s.workStartMsk ?? null,
      workEndMsk: s.workEndMsk ?? null,
      chatMode: s.chatMode ?? null,
      geminiPrompt: s.geminiPrompt ?? null,
      geminiApiKeys: s.geminiApiKeys ?? null,
      welcomeMessage: s.welcomeMessage ?? null,
    },
    update: {
      enabled: s.enabled,
      botToken: s.botToken ?? null,
      telegramChatId: s.telegramChatId ?? null,
      workStartMsk: s.workStartMsk ?? null,
      workEndMsk: s.workEndMsk ?? null,
      chatMode: s.chatMode ?? null,
      geminiPrompt: s.geminiPrompt ?? null,
      geminiApiKeys: s.geminiApiKeys ?? null,
      welcomeMessage: s.welcomeMessage ?? null,
    },
  });
}

// ——— Payments (YooKassa) ———

export async function getPaymentSettings(): Promise<PaymentSettingsContent> {
  const row = await prisma.paymentSettings.findUnique({ where: { id: "payments" } });
  const envShopId = process.env.SHOPID?.trim() || null;
  const envKey = process.env.YOUKASSA?.trim() || null;
  const envEnabled = !!(envShopId && envKey);
  const envSmtpHost = process.env.SMTP_HOST?.trim() || null;
  const envSmtpPortRaw = process.env.SMTP_PORT?.trim() || null;
  const envSmtpPort = envSmtpPortRaw ? Number(envSmtpPortRaw) : null;
  const envSmtpUser = process.env.SMTP_USER?.trim() || null;
  const envSmtpPass = process.env.SMTP_PASS?.trim() || null;
  const envSmtpFrom = process.env.SMTP_FROM?.trim() || null;
  if (!row) {
    const smtpConfigured = !!(envSmtpHost && envSmtpUser && envSmtpPass);
    return {
      enabled: envEnabled,
      yookassaShopId: envShopId,
      yookassaSecretKey: null,
      yookassaSecretKeyMasked: envKey ? "••••••••" : null,
      webhookToken: null,
      testOneRuble: false,
      smtpHost: envSmtpHost,
      smtpPort: envSmtpPort,
      smtpUser: envSmtpUser,
      smtpPassMasked: smtpConfigured ? "••••••••" : null,
      smtpFrom: envSmtpFrom,
    };
  }
  const key = row.yookassaSecretKey?.trim() || envKey;
  const hasKey = !!(key && key.length > 6);
  const smtpHost = row.smtpHost?.trim() || envSmtpHost;
  const smtpPort = row.smtpPort ?? envSmtpPort;
  const smtpUser = row.smtpUser?.trim() || envSmtpUser;
  const smtpPass = row.smtpPass?.trim() || envSmtpPass;
  const smtpFrom = row.smtpFrom?.trim() || envSmtpFrom;
  const smtpConfigured = !!(smtpHost && smtpUser && smtpPass);
  return {
    enabled: row.enabled || envEnabled,
    yookassaShopId: row.yookassaShopId?.trim() || envShopId,
    // не возвращаем ключ клиенту
    yookassaSecretKey: null,
    yookassaSecretKeyMasked: hasKey ? "••••••••" : null,
    webhookToken: row.webhookToken ?? null,
    testOneRuble: row.testOneRuble ?? false,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPassMasked: smtpConfigured ? "••••••••" : null,
    smtpFrom,
  };
}

export async function getPaymentSettingsPrivate(): Promise<{
  enabled: boolean;
  shopId: string | null;
  secretKey: string | null;
  webhookToken: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFrom: string | null;
}> {
  const row = await prisma.paymentSettings.findUnique({ where: { id: "payments" } });
  const envShopId = process.env.SHOPID?.trim() || null;
  const envKey = process.env.YOUKASSA?.trim() || null;
  const envEnabled = !!(envShopId && envKey);
  const envWebhookToken = process.env.YOOKASSA_WEBHOOK_TOKEN?.trim() || null;
  const envSmtpHost = process.env.SMTP_HOST?.trim() || null;
  const envSmtpPortRaw = process.env.SMTP_PORT?.trim() || null;
  const envSmtpPort = envSmtpPortRaw ? Number(envSmtpPortRaw) : null;
  const envSmtpUser = process.env.SMTP_USER?.trim() || null;
  const envSmtpPass = process.env.SMTP_PASS?.trim() || null;
  const envSmtpFrom = process.env.SMTP_FROM?.trim() || null;
  return {
    enabled: (row?.enabled ?? false) || envEnabled,
    shopId: row?.yookassaShopId?.trim() || envShopId,
    secretKey: row?.yookassaSecretKey?.trim() || envKey,
    webhookToken: row?.webhookToken?.trim() || envWebhookToken,
    smtpHost: row?.smtpHost?.trim() || envSmtpHost,
    smtpPort: row?.smtpPort ?? envSmtpPort,
    smtpUser: row?.smtpUser?.trim() || envSmtpUser,
    smtpPass: row?.smtpPass?.trim() || envSmtpPass,
    smtpFrom: row?.smtpFrom?.trim() || envSmtpFrom,
  };
}

export async function writePaymentSettings(p: {
  enabled: boolean;
  yookassaShopId: string | null;
  yookassaSecretKey: string | null;
  webhookToken?: string | null;
  testOneRuble?: boolean;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPass?: string | null;
  smtpFrom?: string | null;
}): Promise<void> {
  await prisma.paymentSettings.upsert({
    where: { id: "payments" },
    create: {
      id: "payments",
      enabled: p.enabled,
      yookassaShopId: p.yookassaShopId,
      yookassaSecretKey: p.yookassaSecretKey,
      webhookToken: p.webhookToken ?? null,
      testOneRuble: p.testOneRuble ?? false,
      smtpHost: p.smtpHost ?? null,
      smtpPort: p.smtpPort ?? null,
      smtpUser: p.smtpUser ?? null,
      smtpPass: p.smtpPass ?? null,
      smtpFrom: p.smtpFrom ?? null,
    },
    update: {
      enabled: p.enabled,
      yookassaShopId: p.yookassaShopId,
      yookassaSecretKey: p.yookassaSecretKey,
      webhookToken: p.webhookToken ?? undefined,
      testOneRuble: p.testOneRuble ?? undefined,
      smtpHost: p.smtpHost ?? undefined,
      smtpPort: p.smtpPort ?? undefined,
      smtpUser: p.smtpUser ?? undefined,
      smtpPass: p.smtpPass ?? undefined,
      smtpFrom: p.smtpFrom ?? undefined,
    },
  });
}

export async function createTicketOrder(input: {
  eventSlug: string;
  ticketId?: string | null;
  ticketName?: string | null;
  email: string;
  amountValue: string;
  currency?: string;
  method?: string | null;
  paymentId?: string | null;
}): Promise<{ id: string }> {
  const row = await prisma.ticketOrder.create({
    data: {
      eventSlug: input.eventSlug,
      ticketId: input.ticketId ?? null,
      ticketName: input.ticketName ?? null,
      email: input.email,
      amountValue: input.amountValue,
      currency: input.currency ?? "RUB",
      method: input.method ?? null,
      paymentId: input.paymentId ?? null,
    },
    select: { id: true },
  });
  return row;
}

export async function setTicketOrderPaymentId(orderId: string, paymentId: string): Promise<void> {
  await prisma.ticketOrder.update({ where: { id: orderId }, data: { paymentId } });
}

export async function getTicketOrderByPaymentId(paymentId: string) {
  return await prisma.ticketOrder.findUnique({ where: { paymentId } });
}

export async function getTicketOrderById(id: string) {
  return await prisma.ticketOrder.findUnique({ where: { id } });
}

export async function markTicketOrderSucceeded(opts: { id: string; ticketNumber: string; qrToken: string }) {
  return await prisma.ticketOrder.update({
    where: { id: opts.id },
    data: { status: "succeeded", ticketNumber: opts.ticketNumber, qrToken: opts.qrToken },
  });
}

export async function markTicketOrderCanceled(id: string) {
  return await prisma.ticketOrder.update({ where: { id }, data: { status: "canceled" } });
}

/** Нормализация номера телефона в E.164 (РФ: +7...) */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("9")) return `+7${digits}`;
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) return `+7${digits.slice(1)}`;
  return null;
}

const PHONE_TAG = /\[PHONE:(.+?)\]/g;
const RUSSIAN_PHONE = /(?:\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}|\b\d{10,11}\b/g;

export function extractPhonesFromText(text: string): string[] {
  const normalized = new Set<string>();
  for (const m of text.matchAll(PHONE_TAG)) {
    const n = normalizePhone(m[1].trim());
    if (n) normalized.add(n);
  }
  const digitBlocks = text.match(RUSSIAN_PHONE) ?? [];
  for (const block of digitBlocks) {
    const n = normalizePhone(block);
    if (n) normalized.add(n);
  }
  return [...normalized];
}

export function stripPhoneTags(text: string): string {
  return text.replace(/\s*\n?\[PHONE:.+?\]\s*/g, "").trim();
}

export async function createLeadPhone(sessionId: string, phone: string): Promise<void> {
  await prisma.leadPhone.create({
    data: { sessionId, phone },
  });
}

export async function getLeadPhones(): Promise<Array<{ id: string; sessionId: string; phone: string; createdAt: Date }>> {
  const rows = await prisma.leadPhone.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((r) => ({ id: r.id, sessionId: r.sessionId, phone: r.phone, createdAt: r.createdAt }));
}

export async function hasLeadPhone(sessionId: string, phone: string): Promise<boolean> {
  const existing = await prisma.leadPhone.findFirst({
    where: { sessionId, phone },
  });
  return !!existing;
}

/** Проверка: сейчас по МСК попадаем в рабочие часы? */
export function isChatWithinWorkingHours(workStartMsk: string | null | undefined, workEndMsk: string | null | undefined): boolean {
  if (!workStartMsk || !workEndMsk) return true;
  const now = new Date();
  const msk = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
  const minutes = msk.getHours() * 60 + msk.getMinutes();
  const [sh, sm] = workStartMsk.split(":").map(Number);
  const [eh, em] = workEndMsk.split(":").map(Number);
  const startMin = (sh ?? 0) * 60 + (sm ?? 0);
  let endMin = (eh ?? 23) * 60 + (em ?? 59);
  if (endMin <= startMin) endMin += 24 * 60; // через полночь
  let curr = minutes;
  if (curr < startMin) curr += 24 * 60;
  return curr >= startMin && curr < endMin;
}

export async function createChatMessage(data: {
  sessionId: string;
  text: string;
  fromAdmin: boolean;
  telegramMessageId?: number;
}): Promise<ChatMessageItem> {
  const row = await prisma.chatMessage.create({
    data: {
      sessionId: data.sessionId,
      text: data.text,
      fromAdmin: data.fromAdmin,
      telegramMessageId: data.telegramMessageId ?? null,
    },
  });
  return {
    id: row.id,
    sessionId: row.sessionId,
    text: row.text,
    fromAdmin: row.fromAdmin,
    createdAt: row.createdAt,
  };
}

export async function getChatMessagesBySession(sessionId: string): Promise<ChatMessageItem[]> {
  const rows = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    sessionId: r.sessionId,
    text: r.text,
    fromAdmin: r.fromAdmin,
    createdAt: r.createdAt,
  }));
}

export async function setChatReplyState(telegramUserId: string, sessionId: string): Promise<void> {
  await prisma.chatReplyState.upsert({
    where: { telegramUserId },
    create: { telegramUserId, sessionId },
    update: { sessionId },
  });
}

export async function getChatReplyState(telegramUserId: string): Promise<{ sessionId: string } | null> {
  const row = await prisma.chatReplyState.findUnique({ where: { telegramUserId } });
  return row ? { sessionId: row.sessionId } : null;
}

export async function deleteChatReplyState(telegramUserId: string): Promise<void> {
  await prisma.chatReplyState.deleteMany({ where: { telegramUserId } });
}
