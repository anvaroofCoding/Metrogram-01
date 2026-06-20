import { getCurrentUserId } from "@/features/auth/auth-session";
import { buildContactMap } from "@/features/chat/lib/conversation-display";
import { pickAvatarColor } from "@/features/users/lib/user-mappers";
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
  return `${formatMemberCount(total)} a'zo, ${formatMemberCount(online)} faol`;
}

function resolveContact(id: string, contactMap: Map<string, Contact>): Contact | undefined {
  return contactMap.get(id);
}

function resolveMemberStatus(contact: Contact | undefined, userId: string): string {
  const currentUserId = getCurrentUserId();
  if (userId === currentUserId) return "online";
  if (contact?.lastSeen) return contact.lastSeen;
  if (contact?.position) return contact.position;
  return "last seen recently";
}

function contactToMember(
  id: string,
  contact: Contact | undefined,
  isOwner: boolean,
): GroupMember {
  if (contact) {
    return {
      id: contact.id,
      name: contact.name,
      status: resolveMemberStatus(contact, id),
      avatarEmoji: contact.avatarEmoji,
      avatarColor: contact.avatarColor,
      isOwner,
    };
  }

  return {
    id,
    name: id === "admin" ? "Admin" : id,
    status: resolveMemberStatus(undefined, id),
    avatarEmoji: id.charAt(0).toUpperCase(),
    avatarColor: pickAvatarColor(id),
    isOwner,
  };
}

export function buildConversationMembers(
  conversation: Conversation,
  contacts: Contact[],
): GroupMember[] {
  const contactMap = buildContactMap(contacts);
  const ownerId = conversation.ownerId ?? conversation.participantIds[0];

  const members = conversation.participantIds.map((id) =>
    contactToMember(id, resolveContact(id, contactMap), id === ownerId),
  );

  return members.sort((a, b) => {
    if (a.isOwner && !b.isOwner) return -1;
    if (!a.isOwner && b.isOwner) return 1;
    if (a.status === "online" && b.status !== "online") return -1;
    if (a.status !== "online" && b.status === "online") return 1;
    return a.name.localeCompare(b.name, "uz");
  });
}

export function hasMemberSupport(conversation: Conversation): boolean {
  return conversation.category === "group" || conversation.category === "channel";
}

export function getConversationOwnerId(conversation: Conversation): string {
  return conversation.ownerId ?? conversation.participantIds[0] ?? "";
}

/** Kanallarda faqat yaratuvchi (owner) xabar yubora oladi. */
export function canPostToConversation(conversation: Conversation | null | undefined): boolean {
  if (!conversation) return false;
  if (conversation.category !== "channel") return true;
  return getCurrentUserId() === getConversationOwnerId(conversation);
}
