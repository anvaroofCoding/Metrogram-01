import {
  filterContactsForCurrentUser,
  filterVisibleConversations,
  getDisplayConversation,
} from "@/features/chat/lib/conversation-display";
import type { ChatCategoryId } from "@/features/chat/constants/categories";
import type { Contact, Conversation } from "@/types/chat";

export type GlobalSearchTab = "all" | "personal" | "contacts" | "group" | "channel" | "bot";

export const GLOBAL_SEARCH_TABS: { id: GlobalSearchTab; label: string }[] = [
  { id: "all", label: "Hammasi" },
  { id: "personal", label: "Suhbatlar" },
  { id: "contacts", label: "Kontaktlar" },
  { id: "group", label: "Guruhlar" },
  { id: "channel", label: "Kanallar" },
  { id: "bot", label: "Botlar" },
];

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchesConversation(conversation: Conversation, query: string): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;

  const display = getDisplayConversation(conversation);
  const preview = conversation.lastMessage?.content ?? "";

  return (
    display.title.toLowerCase().includes(q) ||
    (display.username?.toLowerCase().includes(q) ?? false) ||
    preview.toLowerCase().includes(q)
  );
}

function matchesContact(contact: Contact, query: string): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;

  return (
    contact.name.toLowerCase().includes(q) ||
    (contact.username?.toLowerCase().includes(q) ?? false) ||
    (contact.phone?.toLowerCase().includes(q) ?? false) ||
    (contact.position?.toLowerCase().includes(q) ?? false)
  );
}

function conversationCategory(conversation: Conversation): Exclude<ChatCategoryId, "all"> {
  if (
    conversation.category === "group" ||
    conversation.category === "channel" ||
    conversation.category === "bot"
  ) {
    return conversation.category;
  }
  return "personal";
}

export function searchConversations(
  conversations: Conversation[],
  query: string,
  tab: GlobalSearchTab,
): Conversation[] {
  const visible = filterVisibleConversations(conversations);
  const q = normalizeQuery(query);

  return visible.filter((conversation) => {
    const category = conversationCategory(conversation);
    if (tab !== "all" && tab !== "contacts" && category !== tab) return false;
    if (tab === "contacts") return false;
    return matchesConversation(conversation, q);
  });
}

export function searchContacts(contacts: Contact[], query: string): Contact[] {
  const visible = filterContactsForCurrentUser(contacts);
  return visible.filter((contact) => matchesContact(contact, query));
}

export interface GlobalSearchSections {
  contacts: Contact[];
  personal: Conversation[];
  groups: Conversation[];
  channels: Conversation[];
  bots: Conversation[];
}

export function buildGlobalSearchSections(
  conversations: Conversation[],
  contacts: Contact[],
  query: string,
): GlobalSearchSections {
  const q = normalizeQuery(query);

  const personal = searchConversations(conversations, q, "personal");
  const groups = searchConversations(conversations, q, "group");
  const channels = searchConversations(conversations, q, "channel");
  const bots = searchConversations(conversations, q, "bot");

  return {
    contacts: searchContacts(contacts, q),
    personal,
    groups,
    channels,
    bots,
  };
}

export function hasGlobalSearchResults(sections: GlobalSearchSections): boolean {
  return (
    sections.contacts.length > 0 ||
    sections.personal.length > 0 ||
    sections.groups.length > 0 ||
    sections.channels.length > 0 ||
    sections.bots.length > 0
  );
}
