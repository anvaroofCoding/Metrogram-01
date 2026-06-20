import { useMemo } from "react";
import { getCurrentUserId } from "@/features/auth/auth-session";
import { getOtherParticipantId } from "@/features/chat/lib/conversation-display";
import { formatPeerStatus, resolveContactById } from "@/features/chat/lib/peer-status";
import { useGetContactsQuery } from "@/features/users/api/usersApi";
import { useRealtime } from "@/realtime/RealtimeProvider";
import type { Conversation } from "@/types/chat";

export function usePeerPresence(conversation: Conversation | null | undefined) {
  const { isUserOnline, isPeerTyping, getLastSeenAt } = useRealtime();
  const { data: contacts = [] } = useGetContactsQuery(
    {},
    { skip: !conversation || conversation.category === "channel" },
  );

  return useMemo(() => {
    if (!conversation || conversation.category === "channel") {
      return { statusLabel: "", isTyping: false, isOnline: false, peerId: undefined as string | undefined };
    }

    const peerId = getOtherParticipantId(conversation, getCurrentUserId());
    if (!peerId) {
      return { statusLabel: "last seen recently", isTyping: false, isOnline: false, peerId };
    }

    const contact = resolveContactById(contacts, peerId);
    const isTyping = isPeerTyping(conversation.id, peerId);
    const isOnline = isUserOnline(peerId);
    const lastSeenAt = getLastSeenAt(peerId) ?? contact?.lastSeenAt;
    const statusLabel = formatPeerStatus({
      isTyping,
      isOnline,
      lastSeenAt,
      fallbackLastSeen: conversation.lastSeen ?? contact?.lastSeen,
    });

    return { statusLabel, isTyping, isOnline, peerId };
  }, [conversation, contacts, isUserOnline, isPeerTyping, getLastSeenAt]);
}
