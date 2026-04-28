export type EventType = "upcoming" | "past";

export interface TicketOption {
  id: string;
  name: string;
  price: string;
  earlyBird?: boolean;
}

export interface Event {
  id: string;
  slug: string;
  type: EventType;
  title: string;
  date: string; // ISO or YYYY-MM-DD
  dateDisplay: string;
  time?: string;
  location: string;
  locationShort?: string;
  price?: string;
  priceNote?: string;
  heroImage: string;
  heroTagline?: string; // HTML для hero-блока
  heroTitleTop?: string; // первая строка в hero (как на главной)
  heroTitleBottom?: string; // вторая строка в hero
  tag?: string;
  tagStyle?: string;
  metaTitle: string;
  metaDescription: string;
  artists: string[];
  tickets: TicketOption[];
  aboutParagraphs: string[];
  venueTitle: string;
  venueAddress: string;
  venueCity: string;
  buyTicketUrl?: string;
  /** Скрыть кнопки «Купить билет» на странице ивента и в карусели на главной */
  buyTicketDisabled?: boolean;
  /** Тестовая оплата на странице /pay (эмуляция) */
  testPaymentEnabled?: boolean;
  /** Реальная оплата YooKassa на странице /pay */
  realPaymentEnabled?: boolean;
  age?: string;
  dressCode?: string;
  rules?: string;
  subtitle?: string; // for past events
  gallery?: string[]; // фото мероприятия
  logoScrolled?: string; // логотип после hero (квадратный) для страницы мероприятия
  heroVideo?: string; // видео-превью: показывается в шапке при скролле
  sortOrder?: number; // порядок в админке (меньше = выше)
}

export interface MainContent {
  hero: {
    titleTop: string;
    titleBottom: string;
    heroDate: string;
    heroVenue: string;
    heroVenueEn: string;
    pcImages: string[];
    /** Legacy: desktop video sources (kept for backwards compatibility) */
    videoFull: string;
    videoLite: string;
    /** Hero media config */
    mediaSync?: boolean; // mobile = desktop
    desktopMediaType?: "video" | "image";
    mobileMediaType?: "video" | "image";
    /** Single images (used when mediaType = image) */
    desktopImage?: string;
    mobileImage?: string;
    /** Mobile video sources (optional overrides) */
    mobileVideoFull?: string;
    mobileVideoLite?: string;
    /** Desktop image slideshow */
    desktopImageSlideshow?: boolean;
    logoHero?: string;
    logoScrolled?: string;
  };
  about: {
    heading: string;
    lines: string[];
    ctaHref: string;
  };
  gallery: {
    photos: string[];
  };
  reviews: Array<{ id: number; text: string; author: string }>;
}

export interface MetaContent {
  title: string;
  description: string;
  canonical?: string;
  googleFontUrl?: string;
  fontFamily?: string;
}

export type ChatMode = "telegram" | "gemini";

export interface ChatSettingsContent {
  enabled: boolean;
  botToken?: string | null;
  telegramChatId?: string | null;
  workStartMsk?: string | null;
  workEndMsk?: string | null;
  chatMode?: ChatMode | null;
  geminiPrompt?: string | null;
  geminiApiKeys?: string | null;
  welcomeMessage?: string | null;
}

export interface PaymentSettingsContent {
  enabled: boolean;
  yookassaShopId?: string | null;
  /** Секретный ключ YooKassa. Не логировать/не показывать в UI полностью. */
  yookassaSecretKey?: string | null;
  /** Маска/индикатор для UI */
  yookassaSecretKeyMasked?: string | null;
  webhookToken?: string | null;
  /** Режим тестирования: любой билет за 1₽ */
  testOneRuble?: boolean;
  /** SMTP для отправки билетов */
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  /** Маска/индикатор для UI */
  smtpPassMasked?: string | null;
  smtpFrom?: string | null;
}

export interface ChatMessageItem {
  id: string;
  sessionId: string;
  text: string;
  fromAdmin: boolean;
  createdAt: Date;
}
