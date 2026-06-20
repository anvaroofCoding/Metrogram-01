import type { Contact } from "@/types/chat";

export function formatLastSeenAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "last seen recently";

  const now = new Date();
  const time = date.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `bugun soat ${time} da ko'rilgan`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `kecha soat ${time} da ko'rilgan`;
  }

  const datePart = date.toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
  });

  return `${datePart}, soat ${time} da ko'rilgan`;
}

export function formatPeerStatus(options: {
  isTyping?: boolean;
  isOnline?: boolean;
  lastSeenAt?: string | null;
  fallbackLastSeen?: string;
}): string {
  if (options.isTyping) return "yozmoqda...";
  if (options.isOnline) return "onlayn";
  if (options.lastSeenAt) return formatLastSeenAt(options.lastSeenAt);
  return options.fallbackLastSeen ?? "last seen recently";
}

export function resolveContactById(contacts: Contact[], userId: string): Contact | undefined {
  const direct = contacts.find((c) => c.id === userId);
  if (direct) return direct;
  if (userId === "admin") {
    return contacts.find((c) => c.username === "admin");
  }
  return undefined;
}
