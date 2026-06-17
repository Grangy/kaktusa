/** Реквизиты оператора сайта и пути юридических документов */
export const LEGAL_OPERATOR = {
  brand: "?КАКТУСА",
  ipName: "ИП Рожков Александр Олегович",
  ogrnip: "325920000002004",
  inn: "920357011816",
  email: "m.dolia2017@yandex.ru",
  siteUrl: "https://kaktusa.ru",
  siteHost: "kaktusa.ru",
} as const;

export const LEGAL_PATHS = {
  privacy: "/privacy",
  terms: "/terms",
} as const;

export const LEGAL_CONSENT_STORAGE_KEY = "kaktusa_legal_consent_v1";
