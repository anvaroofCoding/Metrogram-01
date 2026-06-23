import { useTranslation } from "react-i18next";
import {
  APP_LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  type AppLocale,
} from "@/i18n/config";
import { changeAppLocale, getAppLocale } from "@/i18n";

export function useAppLocale() {
  const { i18n } = useTranslation();
  const locale = (isAppLocale(i18n.language) ? i18n.language : getAppLocale()) as AppLocale;

  return {
    locale,
    setLocale: changeAppLocale,
    locales: APP_LOCALES,
    localeLabels: LOCALE_LABELS,
    localeShortLabels: LOCALE_SHORT_LABELS,
  };
}

function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}
