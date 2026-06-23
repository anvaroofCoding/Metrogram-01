import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Icon,
  IconChevronBack,
  IconChevronForward,
  IconSearch,
  IconStar,
} from "@/components/icons";
import { ChatListSkeleton } from "@/features/chat/components/sidebar/ChatListSkeleton";
import { ContactAvatar } from "@/features/chat/components/create-channel/ContactAvatar";
import { filterContactsForCurrentUser } from "@/features/chat/lib/conversation-display";
import { useGetContactsQuery } from "@/features/users/api/usersApi";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/chat";

interface AddMembersStepProps {
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onBack: () => void;
  onCreate: () => void;
  isCreating?: boolean;
}

function ContactCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      role="presentation"
      className={cn(
        "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition",
        checked
          ? "border-[#00bbff] bg-[#00bbff] text-white"
          : "border-zinc-300 bg-transparent dark:border-zinc-600",
      )}
    >
      {checked && (
        <svg viewBox="0 0 12 10" className="h-3 w-3 fill-current">
          <path d="M1 5.5L4.5 9 11 1.5" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      )}
    </span>
  );
}

export function AddMembersStep({
  selectedIds,
  onSelectedIdsChange,
  onBack,
  onCreate,
  isCreating,
}: AddMembersStepProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const canCreate = !isCreating;

  const { data: contacts = [], isLoading } = useGetContactsQuery(
    { search },
    { pollingInterval: 8000 },
  );

  const availableContacts = useMemo(
    () => filterContactsForCurrentUser(contacts),
    [contacts],
  );

  const toggleContact = (contact: Contact) => {
    if (selectedIds.includes(contact.id)) {
      onSelectedIdsChange(selectedIds.filter((id) => id !== contact.id));
      return;
    }
    onSelectedIdsChange([...selectedIds, contact.id]);
  };

  return (
    <div className="relative flex h-full flex-col">
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
          {t("createGroup.membersTitle")}
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
          <ChatListSkeleton count={8} showMeta={false} showCheckbox />
        ) : availableContacts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-400">
            {t("createGroup.membersEmpty")}
          </p>
        ) : (
          availableContacts.map((contact) => {
            const checked = selectedIds.includes(contact.id);
            return (
              <div
                key={contact.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleContact(contact)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleContact(contact);
                }}
                className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <ContactCheckbox checked={checked} />
                <ContactAvatar contact={contact} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-[15px] font-semibold text-zinc-900 dark:text-white">
                      {contact.name}
                    </span>
                    {contact.isPremium && (
                      <Icon icon={IconStar} size={14} className="shrink-0 text-[#00bbff]" />
                    )}
                  </div>
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                    {contact.lastSeen ?? t("presence.lastSeenRecently")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="absolute bottom-5 right-5">
        <button
          type="button"
          onClick={onCreate}
          disabled={!canCreate}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition",
            canCreate
              ? "bg-[#00bbff] text-white hover:bg-[#00a3e0] hover:scale-105"
              : "cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700",
            isCreating && "cursor-wait opacity-70",
          )}
          aria-label={t("createGroup.create")}
        >
          <Icon icon={IconChevronForward} size={28} />
        </button>
      </div>
    </div>
  );
}
