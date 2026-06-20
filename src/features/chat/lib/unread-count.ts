import { getCurrentUserId } from "@/features/auth/auth-session";
import type { Conversation } from "@/types/chat";

export function getDisplayUnreadCount(conversation: Conversation): number {
  const currentUserId = getCurrentUserId();
  const lastSenderId = conversation.lastMessage?.senderId;

  if (lastSenderId && lastSenderId === currentUserId) {
    return 0;
  }

  return conversation.unreadCount;
}
