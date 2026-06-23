import { getCurrentUserId } from "@/features/auth/auth-session";
import {
  formatChatDateLabel,
  formatWeekdayShort,
} from "@/i18n/app-date-format";
import { getAppLocale } from "@/i18n/app-locale";
import { getIntlLocale } from "@/i18n/config";
import { translate } from "@/i18n/translate";
import { formatMessagePreview } from "@/lib/parse-message-content";
import type { Conversation } from "@/types/chat";

const BACKEND_ATTACHMENT_KEYS: Record<string, string> = {
  Rasm: "message.attachment.image",
  Video: "message.attachment.video",
  "Ovozli xabar": "message.attachment.voice",
  PDF: "message.attachment.pdf",
  JSON: "message.attachment.json",
  Fayl: "message.attachment.file",
};

function localizeAttachmentLabel(raw: string): string {
  const key = BACKEND_ATTACHMENT_KEYS[raw];
  return key ? translate(key) : raw;
}

export function getChatListTimeLabel(conversation: Conversation): string {
  if (conversation.timeLabel) return conversation.timeLabel;

  const iso =
    conversation.lastMessage?.createdAt ?? conversation.updatedAt;
  if (!iso) return "";

  const locale = getIntlLocale(getAppLocale());
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString(locale, {
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

  if (isYesterday) return translate("time.yesterday");

  const nowStart = new Date(now);
  nowStart.setHours(0, 0, 0, 0);
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (nowStart.getTime() - dateStart.getTime()) / 86_400_000,
  );

  if (diffDays < 7) {
    return formatWeekdayShort(date);
  }

  return formatChatDateLabel(date, now);
}

export function getChatListPreview(
  conversation: Conversation,
  isTyping = false,
): string {
  const isPersonal =
    conversation.category === "personal" || !conversation.category;

  if (isTyping && isPersonal) return translate("presence.typing");

  const last = conversation.lastMessage;
  const raw = last?.content?.trim() ?? "";

  if (conversation.isVoiceMessage || raw === "Ovozli xabar") {
    return formatOwnPrefix(conversation, translate("message.attachment.voice"));
  }

  if (!raw) return "";

  if (BACKEND_ATTACHMENT_KEYS[raw]) {
    return formatOwnPrefix(conversation, localizeAttachmentLabel(raw));
  }

  return formatOwnPrefix(conversation, formatMessagePreview(raw));
}

function formatOwnPrefix(conversation: Conversation, text: string): string {
  const last = conversation.lastMessage;
  const isOwn = last?.senderId === getCurrentUserId();
  const isGroupLike =
    conversation.category === "group" || conversation.category === "channel";

  if (isOwn && isGroupLike) {
    return translate("chatList.ownPrefix", { text });
  }

  return text;
}

export function isLastMessageOwn(conversation: Conversation): boolean {
  const senderId = conversation.lastMessage?.senderId;
  return Boolean(senderId && senderId === getCurrentUserId());
}
