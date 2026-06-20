import { useMemo } from "react";
import { Icon, IconChevronBack, IconClose, IconSearch } from "@/components/icons";
import { ContactAvatar } from "@/features/chat/components/create-channel/ContactAvatar";
import { ChatListItem } from "@/features/chat/components/sidebar/ChatListItem";
import { ChatListSkeleton } from "@/features/chat/components/sidebar/ChatListSkeleton";
import {
  GLOBAL_SEARCH_TABS,
  buildGlobalSearchSections,
  hasGlobalSearchResults,
  searchContacts,
  searchConversations,
  type GlobalSearchTab,
} from "@/features/chat/lib/global-search";
import { cn } from "@/lib/utils";
import type { Contact, Conversation } from "@/types/chat";

interface GlobalSearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  activeTab: GlobalSearchTab;
  onTabChange: (tab: GlobalSearchTab) => void;
  conversations: Conversation[];
  contacts: Contact[];
  selectedId?: string;
  isLoading?: boolean;
  onConversationSelect: (conversation: Conversation) => void;
  onContactSelect: (contact: Contact) => void;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
      {children}
    </p>
  );
}

function RecentContactsRow({
  contacts,
  onContactSelect,
}: {
  contacts: Contact[];
  onContactSelect: (contact: Contact) => void;
}) {
  if (contacts.length === 0) return null;

  return (
    <div className="shrink-0 border-b border-zinc-100 px-3 pb-3 dark:border-zinc-800">
      <p className="pb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Tez-tez ishlatilgan
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {contacts.slice(0, 12).map((contact) => (
          <button
            key={contact.id}
            type="button"
            onClick={() => onContactSelect(contact)}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"
          >
            <ContactAvatar contact={contact} size="md" />
            <span className="line-clamp-2 w-full text-[11px] leading-tight text-zinc-700 dark:text-zinc-300">
              {contact.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ContactRow({
  contact,
  onClick,
}: {
  contact: Contact;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
    >
      <ContactAvatar contact={contact} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-white">
          {contact.name}
        </p>
        <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
          {contact.username ? `@${contact.username}` : contact.phone}
        </p>
      </div>
    </button>
  );
}

export function GlobalSearchPanel({
  query,
  onQueryChange,
  onClose,
  activeTab,
  onTabChange,
  conversations,
  contacts,
  selectedId,
  isLoading,
  onConversationSelect,
  onContactSelect,
}: GlobalSearchPanelProps) {
  const sections = useMemo(
    () => buildGlobalSearchSections(conversations, contacts, query),
    [conversations, contacts, query],
  );

  const tabContacts = useMemo(
    () => searchContacts(contacts, query),
    [contacts, query],
  );

  const tabConversations = useMemo(
    () => searchConversations(conversations, query, activeTab),
    [conversations, query, activeTab],
  );

  const showRecent = !query.trim();

  const recentConversations = useMemo(() => {
    return searchConversations(conversations, "", "all")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);
  }, [conversations]);

  const renderConversationList = (items: Conversation[]) =>
    items.map((conversation) => (
      <ChatListItem
        key={conversation.id}
        conversation={conversation}
        selected={selectedId === conversation.id}
        onClick={() => onConversationSelect(conversation)}
      />
    ));

  const renderAllResults = () => {
    if (showRecent) {
      if (recentConversations.length === 0) {
        return (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Qidirish uchun matn kiriting
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Kontakt, suhbat, guruh, kanal yoki bot nomi
            </p>
          </div>
        );
      }

      return (
        <>
          <SectionTitle>So&apos;nggi suhbatlar</SectionTitle>
          {renderConversationList(recentConversations)}
        </>
      );
    }

    if (!hasGlobalSearchResults(sections)) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Natija topilmadi</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Kontakt, suhbat, guruh, kanal yoki bot nomini kiriting
          </p>
        </div>
      );
    }

    return (
      <>
        {sections.contacts.length > 0 && (
          <>
            <SectionTitle>Kontaktlar</SectionTitle>
            {sections.contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onClick={() => onContactSelect(contact)}
              />
            ))}
          </>
        )}
        {sections.personal.length > 0 && (
          <>
            <SectionTitle>Suhbatlar</SectionTitle>
            {renderConversationList(sections.personal)}
          </>
        )}
        {sections.groups.length > 0 && (
          <>
            <SectionTitle>Guruhlar</SectionTitle>
            {renderConversationList(sections.groups)}
          </>
        )}
        {sections.channels.length > 0 && (
          <>
            <SectionTitle>Kanallar</SectionTitle>
            {renderConversationList(sections.channels)}
          </>
        )}
        {sections.bots.length > 0 && (
          <>
            <SectionTitle>Botlar</SectionTitle>
            {renderConversationList(sections.bots)}
          </>
        )}
      </>
    );
  };

  const renderTabResults = () => {
    if (activeTab === "contacts") {
      if (tabContacts.length === 0) {
        return (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Kontakt topilmadi</p>
          </div>
        );
      }
      return tabContacts.map((contact) => (
        <ContactRow
          key={contact.id}
          contact={contact}
          onClick={() => onContactSelect(contact)}
        />
      ));
    }

    if (tabConversations.length === 0) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Natija topilmadi</p>
        </div>
      );
    }

    return renderConversationList(tabConversations);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-2 px-2 pt-3 pb-2">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Orqaga"
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>

        <div className="relative min-w-0 flex-1">
          <Icon
            icon={IconSearch}
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            autoFocus
            placeholder="Qidirish"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className={cn(
              "w-full rounded-full py-2.5 pl-9 pr-9 text-sm outline-none",
              "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400",
              "dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500",
              "focus:ring-2 focus:ring-[#00bbff]/30",
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              aria-label="Tozalash"
            >
              <Icon icon={IconClose} size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="flex shrink-0 gap-1 overflow-x-auto px-3 pb-2 scrollbar-none">
        {GLOBAL_SEARCH_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[#00bbff] text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showRecent && (
        <RecentContactsRow contacts={tabContacts} onContactSelect={onContactSelect} />
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatListSkeleton count={8} />
        ) : activeTab === "all" ? (
          renderAllResults()
        ) : (
          renderTabResults()
        )}
      </div>
    </div>
  );
}
