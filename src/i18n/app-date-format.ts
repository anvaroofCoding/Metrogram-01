import { getAppLocale } from "@/i18n/app-locale";
import type { AppLocale } from "@/i18n/config";

const MONTHS: Record<AppLocale, readonly string[]> = {
  "uz-Latn": [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ],
  "uz-Cyrl": [
    "январ",
    "феврал",
    "март",
    "апрел",
    "май",
    "июн",
    "июл",
    "август",
    "сентябр",
    "октябр",
    "ноябр",
    "декабр",
  ],
  ru: [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ],
};

const WEEKDAYS_SHORT: Record<AppLocale, readonly string[]> = {
  "uz-Latn": ["yak", "du", "se", "chor", "pay", "jum", "shan"],
  "uz-Cyrl": ["як", "ду", "се", "чор", "пай", "жу", "шан"],
  ru: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
};

function monthName(date: Date, locale: AppLocale = getAppLocale()): string {
  return MONTHS[locale][date.getMonth()] ?? "";
}

/** Chat o'rtasidagi sana: 16-may yoki 16 may 2025-yil */
export function formatChatDateLabel(
  date: Date,
  referenceDate: Date = new Date(),
): string {
  const locale = getAppLocale();
  const day = date.getDate();
  const month = monthName(date, locale);
  const year = date.getFullYear();
  const sameYear = year === referenceDate.getFullYear();

  if (locale === "ru") {
    if (sameYear) return `${day} ${month}`;
    return `${day} ${month} ${year}`;
  }

  if (sameYear) return `${day}-${month}`;
  return `${day} ${month} ${year}-yil`;
}

/** Qisqa: 16-may */
export function formatShortAppDate(date: Date): string {
  return `${date.getDate()}-${monthName(date)}`;
}

/** Hafta kuni qisqa */
export function formatWeekdayShort(date: Date): string {
  const locale = getAppLocale();
  return WEEKDAYS_SHORT[locale][date.getDay()] ?? "";
}

/** Kalendar sarlavhasi: may 2025 */
export function formatMonthYear(date: Date): string {
  const locale = getAppLocale();
  const month = monthName(date, locale);
  const year = date.getFullYear();

  if (locale === "ru") return `${month} ${year}`;
  return `${month} ${year}`;
}
