import type { Conversation } from "@/types/chat";

/** Oxirgi xabar vaqti — ro'yxat tartibi uchun */
export function getConversationActivityTime(conversation: Conversation): number {
  const fromLastMessage = conversation.lastMessage?.createdAt;
  const fromUpdated = conversation.updatedAt;
  const raw = fromLastMessage ?? fromUpdated;
  const time = raw ? new Date(raw).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

/** Eng yaqin faollik yuqorida */
export function sortConversationsByActivity(
  conversations: Conversation[],
): Conversation[] {
  return [...conversations].sort(
    (a, b) => getConversationActivityTime(b) - getConversationActivityTime(a),
  );
}

function getPinnedListTime(conversation: Conversation): number {
  if (!conversation.pinnedListAt) return 0;
  const time = new Date(conversation.pinnedListAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** Pin qilinganlar birinchi, keyin faollik bo'yicha */
export function sortConversationsForSidebar(
  conversations: Conversation[],
): Conversation[] {
  const pinned = conversations.filter((c) => c.isPinned);
  const unpinned = conversations.filter((c) => !c.isPinned);

  return [
    ...[...pinned].sort((a, b) => getPinnedListTime(b) - getPinnedListTime(a)),
    ...sortConversationsByActivity(unpinned),
  ];
}
