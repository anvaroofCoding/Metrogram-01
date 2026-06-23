import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconChevronBack, IconPersonAdd, IconSearch } from "@/components/icons";
import { ContactAvatar } from "@/features/chat/components/create-channel/ContactAvatar";
import { ConfirmMemberDialog } from "@/features/chat/components/create-channel/ConfirmMemberDialog";
import { ChatListSkeleton } from "@/features/chat/components/sidebar/ChatListSkeleton";
import { useAddMembersMutation } from "@/features/chat/api/chatApi";
import {
  dedupeContacts,
  isContactAlreadyInConversation,
  isSelfContact,
} from "@/features/chat/lib/conversation-display";
import { getCurrentUserId } from "@/features/auth/auth-session";
import { useGetContactsQuery } from "@/features/users/api/usersApi";
import { cn } from "@/lib/utils";
import type { Contact, Conversation } from "@/types/chat";

interface AddMembersPanelProps {
  conversation: Conversation;
  contacts: Contact[];
  onBack: () => void;
  onAdded?: (conversation: Conversation) => void;
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

export function AddMembersPanel({
  conversation,
  contacts,
  onBack,
  onAdded,
}: AddMembersPanelProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingContact, setPendingContact] = useState<Contact | null>(null);

  const trimmedSearch = search.trim();
  const { data: searchResults = [], isLoading: isSearching } = useGetContactsQuery(
    { search: trimmedSearch },
    { skip: !trimmedSearch },
  );

  const { mutateAsync: addMembers, isLoading: isAdding } = useAddMembersMutation();

  const sourceContacts = trimmedSearch ? searchResults : contacts;

  const availableContacts = useMemo(() => {
    const visible = dedupeContacts(sourceContacts).filter(
      (contact) =>
        !isSelfContact(contact, getCurrentUserId(), contacts) &&
        !isContactAlreadyInConversation(contact, conversation, contacts),
    );
    return visible;
  }, [sourceContacts, contacts, conversation]);

  const toggleContact = (contact: Contact) => {
    if (selectedIds.includes(contact.id)) {
      setSelectedIds((prev) => prev.filter((id) => id !== contact.id));
      return;
    }
    setPendingContact(contact);
  };

  const confirmAdd = () => {
    if (!pendingContact) return;
    setSelectedIds((prev) => [...prev, pendingContact.id]);
    setPendingContact(null);
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    const updated = await addMembers({
      conversationId: conversation.id,
      memberIds: selectedIds,
    });
    onAdded?.(updated);
    onBack();
  };

  const showLoading = trimmedSearch ? isSearching : false;

  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-[28px] bg-[#f4f4f5] dark:bg-[#1c1e1e]">
      <header className="flex shrink-0 items-center px-2 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label={t("common.back")}
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-zinc-900 dark:text-white">
          {t("info.membersAddTitle")}
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
              "bg-white text-zinc-900 placeholder:text-zinc-400",
              "dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500",
              "focus:ring-2 focus:ring-[#00bbff]/30",
            )}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showLoading ? (
          <ChatListSkeleton count={8} showMeta={false} showCheckbox />
        ) : availableContacts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-400">
            {t("info.membersAddEmpty")}
          </p>
        ) : (
          availableContacts.map((contact) => {
            const checked = selectedIds.includes(contact.id);
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => toggleContact(contact)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-white/70 dark:hover:bg-zinc-800/50"
              >
                <ContactCheckbox checked={checked} />
                <ContactAvatar contact={contact} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-white">
                    {contact.name}
                  </p>
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                    {contact.lastSeen ?? t("presence.lastSeenRecently")}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="absolute bottom-5 right-5">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={selectedIds.length === 0 || isAdding}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition",
            "bg-[#00bbff] text-white hover:bg-[#00a3e0] hover:scale-105",
            (selectedIds.length === 0 || isAdding) && "cursor-not-allowed opacity-60",
          )}
          aria-label={t("info.membersAddConfirm")}
        >
          <Icon icon={IconPersonAdd} size={26} />
        </button>
      </div>

      <ConfirmMemberDialog
        open={!!pendingContact}
        contact={pendingContact}
        channelName={conversation.title}
        onCancel={() => setPendingContact(null)}
        onConfirm={confirmAdd}
      />
    </div>
  );
}
