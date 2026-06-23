export const APP_LOCALES = ["uz-Latn", "uz-Cyrl", "ru"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "uz-Latn";

export const LOCALE_STORAGE_KEY = "metrogram-lang";

export const LOCALE_LABELS: Record<AppLocale, string> = {
  "uz-Latn": "O'zbek (Lotin)",
  "uz-Cyrl": "Ўзбек (Кирил)",
  ru: "Русский",
};

export const LOCALE_SHORT_LABELS: Record<AppLocale, string> = {
  "uz-Latn": "O'zbek",
  "uz-Cyrl": "Ўзбек",
  ru: "Русский",
};

/** Intl / toLocaleDateString locale tag */
export function getIntlLocale(locale: AppLocale): string {
  switch (locale) {
    case "uz-Cyrl":
      return "uz-UZ";
    case "ru":
      return "ru-RU";
    default:
      return "uz-UZ";
  }
}

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}
