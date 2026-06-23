import { getCurrentUserId, readAuthUser } from "@/features/auth/auth-session";
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

  const authUser = readAuthUser();
  if (authUser) {
    const authUsername = authUser.username.toLowerCase();
    const refersToAuthUser =
      userId === authUser.id ||
      userId === "admin" ||
      aliases.has(authUser.id) ||
      (contact?.username != null &&
        contact.username.toLowerCase() === authUsername) ||
      (contact?.phone != null && contact.phone === authUser.phone);

    if (refersToAuthUser) {
      aliases.add(authUser.id);
      if (authUser.username === "admin") aliases.add("admin");

      const authContact =
        contact ??
        contacts.find((entry) => entry.id === authUser.id) ??
        (authUser.username === "admin"
          ? contacts.find((entry) => entry.username === "admin")
          : undefined);

      if (authContact) {
        aliases.add(authContact.id);
        if (authContact.username === "admin") aliases.add("admin");
      }
    }
  }

  return aliases;
}

export function isSameUserId(
  userIdA: string,
  userIdB: string,
  contacts: Contact[] = [],
): boolean {
  const aliasesA = buildUserIdAliasSet(userIdA, contacts);
  return [...buildUserIdAliasSet(userIdB, contacts)].some((id) => aliasesA.has(id));
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
  const contacts = options.contacts ?? [];
  const currentUserId = getCurrentUserId();

  if (isSameUserId(options.userId, currentUserId, contacts)) {
    throw new Error("O'zingizga yozish mumkin emas");
  }

  const existing = findPersonalConversation(
    options.conversations,
    options.userId,
    contacts,
  );
  if (existing) return existing;
  return options.openPersonalChat({ userId: options.userId });
}
