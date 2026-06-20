import { getCurrentUserId } from "@/features/auth/auth-session";
import type { Contact, Conversation } from "@/types/chat";

export function buildUserIdAliasSet(
  userId: string,
  contacts: Contact[] = [],
): Set<string> {
  const aliases = new Set<string>([userId]);

  const contact =
    contacts.find((entry) => entry.id === userId) ??
    (userId === "admin"
      ? contacts.find((entry) => entry.username === "admin")
      : undefined);

  if (contact) {
    aliases.add(contact.id);
    if (contact.username === "admin") aliases.add("admin");
  }

  if (userId === "admin") {
    aliases.add("admin");
  }

  return aliases;
}

export function findPersonalConversation(
  conversations: Conversation[],
  userId: string,
  contacts: Contact[] = [],
): Conversation | undefined {
  const currentUserId = getCurrentUserId();
  const targetAliases = buildUserIdAliasSet(userId, contacts);
  const requesterAliases = buildUserIdAliasSet(currentUserId, contacts);

  return conversations.find(
    (conversation) =>
      conversation.category === "personal" &&
      conversation.participantIds.length === 2 &&
      conversation.participantIds.some((id) => targetAliases.has(id)) &&
      conversation.participantIds.some((id) => requesterAliases.has(id)),
  );
}

export async function openOrFindPersonalChat(options: {
  userId: string;
  conversations: Conversation[];
  contacts?: Contact[];
  openPersonalChat: (args: { userId: string }) => Promise<Conversation>;
}): Promise<Conversation> {
  const existing = findPersonalConversation(
    options.conversations,
    options.userId,
    options.contacts ?? [],
  );
  if (existing) return existing;
  return options.openPersonalChat({ userId: options.userId });
}
