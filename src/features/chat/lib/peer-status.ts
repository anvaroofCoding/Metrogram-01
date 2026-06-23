import { formatShortAppDate } from "@/i18n/app-date-format";
import { getAppLocale } from "@/i18n/app-locale";
import { getIntlLocale } from "@/i18n/config";
import { translate } from "@/i18n/translate";
import type { Contact } from "@/types/chat";

export function formatLastSeenAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return translate("presence.lastSeenRecently");

  const locale = getIntlLocale(getAppLocale());
  const time = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return translate("presence.lastSeenToday", { time });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return translate("presence.lastSeenYesterday", { time });
  }

  const datePart = formatShortAppDate(date);

  return translate("presence.lastSeenDate", { date: datePart, time });
}

export function formatPeerStatus(options: {
  isTyping?: boolean;
  isOnline?: boolean;
  lastSeenAt?: string | null;
  fallbackLastSeen?: string;
}): string {
  if (options.isTyping) return translate("presence.typing");
  if (options.isOnline) return translate("presence.online");
  if (options.lastSeenAt) return formatLastSeenAt(options.lastSeenAt);
  return options.fallbackLastSeen ?? translate("presence.lastSeenRecently");
}

export function resolveContactById(contacts: Contact[], userId: string): Contact | undefined {
  const direct = contacts.find((c) => c.id === userId);
  if (direct) return direct;
  if (userId === "admin") {
    return contacts.find((c) => c.username === "admin");
  }
  return undefined;
}
