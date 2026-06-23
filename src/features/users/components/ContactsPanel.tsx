import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconChevronBack, IconSearch } from "@/components/icons";
import { ContactAvatar } from "@/features/chat/components/create-channel/ContactAvatar";
import { ChatListSkeleton } from "@/features/chat/components/sidebar/ChatListSkeleton";
import { useGetContactsQuery } from "@/features/users/api/usersApi";
import { useContactRealtime } from "@/features/users/realtime/contact-realtime";
import { filterContactsForCurrentUser } from "@/features/chat/lib/conversation-display";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/chat";

interface ContactsPanelProps {
  onBack: () => void;
  onContactSelect?: (contact: Contact) => void;
}

export function ContactsPanel({ onBack, onContactSelect }: ContactsPanelProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  useContactRealtime();

  const { data: contacts = [], isLoading, isError, error, refetch } = useGetContactsQuery(
    { search },
    { pollingInterval: 8000 },
  );

  const visibleContacts = filterContactsForCurrentUser(contacts);

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden rounded-[28px] bg-white dark:bg-[#1e1e1e]">
      <header className="flex shrink-0 items-center px-2 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label={t("common.back")}
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-zinc-900 dark:text-white">
          {t("contacts.title")}
        </h1>
        <div className="w-10" />
      </header>

      <div className="shrink-0 px-3 pb-2">
        <div className="relative">
          <Icon
            icon={IconSearch}
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full rounded-full py-2.5 pl-9 pr-4 text-sm outline-none",
              "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400",
              "dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500",
              "focus:ring-2 focus:ring-[#00bbff]/30",
            )}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatListSkeleton count={10} showMeta={false} />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p className="text-sm text-red-500">
              {error instanceof Error ? error.message : t("common.loadFailed")}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-full bg-[#00bbff] px-5 py-2 text-sm font-medium text-white hover:bg-[#00a3e0]"
            >
              {t("common.retry")}
            </button>
          </div>
        ) : visibleContacts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <p className="text-sm text-zinc-500">{t("contacts.empty")}</p>
          </div>
        ) : (
          visibleContacts.map((contact) => {
            const row = (
              <>
                <ContactAvatar contact={contact} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-white">
                    {contact.name}
                  </p>
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                    {contact.username ? `@${contact.username}` : contact.phone}
                    {contact.position ? ` · ${contact.position}` : ""}
                  </p>
                </div>
              </>
            );

            if (onContactSelect) {
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => onContactSelect(contact)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  {row}
                </button>
              );
            }

            return (
              <div
                key={contact.id}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
              >
                {row}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
