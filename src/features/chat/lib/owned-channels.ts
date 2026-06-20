import { getCurrentUserId } from "@/features/auth/auth-session";
import type { Conversation } from "@/types/chat";

export function isOwnedChannel(
  conversation: Conversation,
  currentUserId = getCurrentUserId(),
): boolean {
  if (conversation.category !== "channel") return false;

  const ownerId = conversation.ownerId ?? conversation.participantIds[0];
  return ownerId === currentUserId;
}

export function filterOwnedChannels(
  conversations: Conversation[],
  currentUserId = getCurrentUserId(),
): Conversation[] {
  return conversations.filter((conversation) =>
    isOwnedChannel(conversation, currentUserId),
  );
}
