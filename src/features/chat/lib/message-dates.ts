import { formatChatDateLabel } from "@/i18n/app-date-format";
import { getAppLocale } from "@/i18n/app-locale";
import { getIntlLocale } from "@/i18n/config";
import { translate } from "@/i18n/translate";

export function toDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateSeparator(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(date, now)) return translate("time.today");
  if (sameDay(date, yesterday)) return translate("time.yesterday");

  return formatChatDateLabel(date, now);
}

export function formatTime(iso: string): string {
  const locale = getIntlLocale(getAppLocale());
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
