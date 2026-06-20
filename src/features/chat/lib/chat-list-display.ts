import { getCurrentUserId } from "@/features/auth/auth-session";
import type { Conversation } from "@/types/chat";

const ATTACHMENT_LABELS = new Set([
  "Rasm",
  "Video",
  "Ovozli xabar",
  "PDF",
  "JSON",
  "Fayl",
]);

export function getChatListTimeLabel(conversation: Conversation): string {
  if (conversation.timeLabel) return conversation.timeLabel;

  const iso =
    conversation.lastMessage?.createdAt ?? conversation.updatedAt;
  if (!iso) return "";

  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Kecha";

  const nowStart = new Date(now);
  nowStart.setHours(0, 0, 0, 0);
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (nowStart.getTime() - dateStart.getTime()) / 86_400_000,
  );

  if (diffDays < 7) {
    return date.toLocaleDateString("uz-UZ", { weekday: "short" });
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  });
}

export function getChatListPreview(
  conversation: Conversation,
  isTyping = false,
): string {
  const isPersonal =
    conversation.category === "personal" || !conversation.category;

  if (isTyping && isPersonal) return "yozmoqda...";

  const last = conversation.lastMessage;
  const raw = last?.content?.trim() ?? "";

  if (conversation.isVoiceMessage || raw === "Ovozli xabar") {
    return formatOwnPrefix(conversation, "Ovozli xabar");
  }

  if (!raw) return "";

  if (ATTACHMENT_LABELS.has(raw)) {
    return formatOwnPrefix(conversation, raw);
  }

  return formatOwnPrefix(conversation, raw);
}

function formatOwnPrefix(conversation: Conversation, text: string): string {
  const last = conversation.lastMessage;
  const isOwn = last?.senderId === getCurrentUserId();
  const isGroupLike =
    conversation.category === "group" || conversation.category === "channel";

  if (isOwn && isGroupLike) {
    return `Siz: ${text}`;
  }

  return text;
}

export function isLastMessageOwn(conversation: Conversation): boolean {
  const senderId = conversation.lastMessage?.senderId;
  return Boolean(senderId && senderId === getCurrentUserId());
}
