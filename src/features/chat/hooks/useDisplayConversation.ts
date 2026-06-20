import { useMemo } from "react";
import { getCurrentUserId } from "@/features/auth/auth-session";
import { getDisplayConversation } from "@/features/chat/lib/conversation-display";
import { useGetContactsQuery } from "@/features/users/api/usersApi";
import type { Conversation } from "@/types/chat";

export function useDisplayConversation(conversation: Conversation) {
  const { data: contacts = [] } = useGetContactsQuery({});
  return useMemo(
    () => getDisplayConversation(conversation, getCurrentUserId(), contacts),
    [conversation, contacts],
  );
}
