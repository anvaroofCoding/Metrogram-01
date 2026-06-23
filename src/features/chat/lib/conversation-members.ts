import { getCurrentUserId } from "@/features/auth/auth-session";
import { buildContactMap, isSelfConversation } from "@/features/chat/lib/conversation-display";
import { isSameUserId } from "@/features/chat/lib/personal-conversation";
import { pickAvatarColor } from "@/features/users/lib/user-mappers";
import { translate } from "@/i18n/translate";
import type { GroupMember } from "@/features/chat/components/user-info/demo-data";
import type { Contact, Conversation } from "@/types/chat";

function formatMemberCount(count: number): string {
  return count.toLocaleString("fr-FR");
}

export function countOnlineMembers(
  conversation: Conversation,
  contacts: Contact[],
  currentUserId = getCurrentUserId(),
): number {
  const contactMap = buildContactMap(contacts);
  return conversation.participantIds.filter((id) => {
    if (id === currentUserId) return true;
    return contactMap.get(id)?.lastSeen === "online";
  }).length;
}

export function getChannelMemberStats(
  conversation: Conversation,
  contacts: Contact[],
  currentUserId = getCurrentUserId(),
): string {
  const total = conversation.subscriberCount ?? conversation.participantIds.length;
  const online = countOnlineMembers(conversation, contacts, currentUserId);
  return translate("info.channelStats", {
    total: formatMemberCount(total),
    online: formatMemberCount(online),
  });
}

function resolveContact(id: string, contacts: Contact[]): Contact | undefined {
  const contactMap = buildContactMap(contacts);
  const direct = contactMap.get(id);
  if (direct) return direct;

  return contacts.find((contact) => isSameUserId(contact.id, id, contacts));
}

function resolveMemberStatus(
  contact: Contact | undefined,
  userId: string,
  contacts: Contact[],
): string {
  const currentUserId = getCurrentUserId();
  if (isSameUserId(userId, currentUserId, contacts)) return translate("presence.online");
  if (contact?.lastSeen === "online") return translate("presence.online");
  if (contact?.lastSeen) return contact.lastSeen;
  if (contact?.position) return contact.position;
  return translate("presence.lastSeenRecently");
}

function contactToMember(
  participantId: string,
  contact: Contact | undefined,
  isOwner: boolean,
  contacts: Contact[],
): GroupMember {
  if (contact) {
    return {
      id: participantId,
      name: contact.name,
      status: resolveMemberStatus(contact, participantId, contacts),
      avatarEmoji: contact.avatarEmoji,
      avatarColor: contact.avatarColor,
      isOwner,
    };
  }

  return {
    id: participantId,
    name: participantId === "admin" ? translate("info.memberAdmin") : participantId,
    status: resolveMemberStatus(undefined, participantId, contacts),
    avatarEmoji: participantId.charAt(0).toUpperCase(),
    avatarColor: pickAvatarColor(participantId),
    isOwner,
  };
}

export function buildConversationMembers(
  conversation: Conversation,
  contacts: Contact[],
): GroupMember[] {
  const ownerId = conversation.ownerId ?? conversation.participantIds[0];

  const uniqueParticipantIds: string[] = [];
  for (const id of conversation.participantIds) {
    const duplicate = uniqueParticipantIds.some((existing) =>
      isSameUserId(existing, id, contacts),
    );
    if (!duplicate) uniqueParticipantIds.push(id);
  }

  const members = uniqueParticipantIds.map((id) =>
    contactToMember(
      id,
      resolveContact(id, contacts),
      isSameUserId(id, ownerId, contacts),
      contacts,
    ),
  );

  return members.sort((a, b) => {
    if (a.isOwner && !b.isOwner) return -1;
    if (!a.isOwner && b.isOwner) return 1;
    if (a.status === translate("presence.online") && b.status !== translate("presence.online")) return -1;
    if (a.status !== translate("presence.online") && b.status === translate("presence.online")) return 1;
    return a.name.localeCompare(b.name, "uz");
  });
}

export function getConversationMemberCount(
  conversation: Conversation,
  contacts: Contact[] = [],
): number {
  return buildConversationMembers(conversation, contacts).length;
}

export function hasMemberSupport(conversation: Conversation): boolean {
  return conversation.category === "group" || conversation.category === "channel";
}

export function getConversationOwnerId(conversation: Conversation): string {
  return conversation.ownerId ?? conversation.participantIds[0] ?? "";
}

/** Kanallarda faqat yaratuvchi (owner) xabar yubora oladi. O'ziga yozish taqiqlanadi. */
export function canPostToConversation(
  conversation: Conversation | null | undefined,
  contacts: Contact[] = [],
): boolean {
  if (!conversation) return false;
  if (isSelfConversation(conversation, getCurrentUserId(), contacts)) return false;
  if (conversation.category !== "channel") return true;
  return getCurrentUserId() === getConversationOwnerId(conversation);
}
