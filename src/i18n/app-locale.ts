import i18n from "i18next";
import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from "@/i18n/config";

export function getAppLocale(): AppLocale {
  const lang = i18n.language;
  return isAppLocale(lang) ? lang : DEFAULT_LOCALE;
}
