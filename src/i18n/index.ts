import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isAppLocale,
  type AppLocale,
} from "@/i18n/config";
import uzLatn from "@/i18n/locales/uz-Latn.json";
import uzCyrl from "@/i18n/locales/uz-Cyrl.json";
import ru from "@/i18n/locales/ru.json";

function readStoredLocale(): AppLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isAppLocale(stored)) return stored;
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

const initialLocale = readStoredLocale();

void i18n.use(initReactI18next).init({
  resources: {
    "uz-Latn": { translation: uzLatn },
    "uz-Cyrl": { translation: uzCyrl },
    ru: { translation: ru },
  },
  lng: initialLocale,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
});

document.documentElement.lang = initialLocale;

export function changeAppLocale(locale: AppLocale): void {
  void i18n.changeLanguage(locale);
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.documentElement.lang = locale;
}

export { getAppLocale } from "@/i18n/app-locale";
export { getIntlLocale } from "@/i18n/config";

export default i18n;
