import { getCurrentUserId } from "@/features/auth/auth-session";
import { isSameUserId } from "@/features/chat/lib/personal-conversation";
import { pickAvatarColor } from "@/features/users/lib/user-mappers";
import type { Contact, Conversation } from "@/types/chat";

const ADMIN_PEER = {
  title: "Admin",
  avatarEmoji: "M",
  avatarColor: "#00bbff",
  lastSeen: "online",
} as const;

export function buildContactMap(contacts: Contact[]): Map<string, Contact> {
  const map = new Map<string, Contact>();
  for (const contact of contacts) {
    map.set(contact.id, contact);
    if (contact.username === "admin") {
      map.set("admin", contact);
    }
  }
  return map;
}

export function getAvatarInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

function enrichConversationAvatar(
  conversation: Conversation,
  contacts?: Contact[],
  peerId?: string,
): Conversation {
  const contactMap = contacts?.length ? buildContactMap(contacts) : undefined;
  const contact = peerId && contactMap ? contactMap.get(peerId) : undefined;
  const title = conversation.title.trim();
  const colorSeed = contact?.name?.trim() || title || peerId || conversation.id;

  return {
    ...conversation,
    avatarUrl: contact?.avatarUrl ?? conversation.avatarUrl,
    avatarEmoji:
      contact?.avatarEmoji ??
      conversation.avatarEmoji ??
      getAvatarInitial(title),
    avatarColor:
      contact?.avatarColor ??
      conversation.avatarColor ??
      pickAvatarColor(colorSeed),
  };
}

export function getOtherParticipantId(
  conversation: Conversation,
  currentUserId = getCurrentUserId(),
): string | undefined {
  return conversation.participantIds.find((id) => id !== currentUserId);
}

/** Shaxsiy suhbat, unda barcha ishtirokchilar bitta foydalanuvchi (masalan admin + mongo id) */
export function isSelfConversation(
  conversation: Conversation,
  _currentUserId = getCurrentUserId(),
  contacts: Contact[] = [],
): boolean {
  if (conversation.category !== "personal") return false;

  const { participantIds } = conversation;
  if (participantIds.length === 0) return true;

  const [first, ...rest] = participantIds;
  return rest.every((id) => isSameUserId(id, first, contacts));
}

export function isSelfContact(
  contact: Contact,
  currentUserId = getCurrentUserId(),
  contacts: Contact[] = [],
): boolean {
  return isSameUserId(
    contact.id,
    currentUserId,
    contacts.length > 0 ? contacts : [contact],
  );
}

/** Chat ro'yxati va header uchun ko'rinish (qarshi tomondagi odam) */
export function getDisplayConversation(
  conversation: Conversation,
  currentUserId = getCurrentUserId(),
  contacts?: Contact[],
): Conversation {
  if (conversation.category === "personal") {
    const otherId = getOtherParticipantId(conversation, currentUserId);

    if (otherId === "admin" && currentUserId !== "admin") {
      return enrichConversationAvatar(
        {
          ...conversation,
          title: ADMIN_PEER.title,
          lastSeen: ADMIN_PEER.lastSeen,
          username: "admin",
          avatarEmoji: ADMIN_PEER.avatarEmoji,
          avatarColor: ADMIN_PEER.avatarColor,
        },
        contacts,
        "admin",
      );
    }

    return enrichConversationAvatar(conversation, contacts, otherId);
  }

  return enrichConversationAvatar(conversation, contacts);
}

export function filterVisibleConversations(
  conversations: Conversation[],
  currentUserId = getCurrentUserId(),
  contacts: Contact[] = [],
): Conversation[] {
  return conversations.filter(
    (conversation) => !isSelfConversation(conversation, currentUserId, contacts),
  );
}

export function filterContactsForCurrentUser(
  contacts: Contact[],
  currentUserId = getCurrentUserId(),
): Contact[] {
  return dedupeContacts(
    contacts.filter((contact) => !isSelfContact(contact, currentUserId, contacts)),
  );
}

export function isContactAlreadyInConversation(
  contact: Contact,
  conversation: Conversation,
  contacts: Contact[] = [],
): boolean {
  return conversation.participantIds.some((participantId) =>
    isSameUserId(participantId, contact.id, contacts),
  );
}

/** Bir xil foydalanuvchi (admin alias va h.k.) takrorlanmasin */
export function dedupeContacts(contacts: Contact[]): Contact[] {
  const result: Contact[] = [];
  for (const contact of contacts) {
    const duplicate = result.some((existing) =>
      isSameUserId(existing.id, contact.id, contacts),
    );
    if (!duplicate) result.push(contact);
  }
  return result;
}
