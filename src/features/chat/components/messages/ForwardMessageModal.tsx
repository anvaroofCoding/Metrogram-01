import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconClose, IconSearch } from "@/components/icons";
import { useGetConversationsQuery } from "@/features/chat/api/chatApi";
import { getDisplayConversation } from "@/features/chat/lib/conversation-display";
import { ChatAvatar } from "@/features/chat/components/sidebar/ChatAvatar";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/types/chat";

interface ForwardMessageModalProps {
  open: boolean;
  messages: Message[];
  currentConversationId: string;
  onClose: () => void;
  onForward: (targetConversationId: string, messages: Message[]) => void;
}

export function ForwardMessageModal({
  open,
  messages,
  currentConversationId,
  onClose,
  onForward,
}: ForwardMessageModalProps) {
  const { t } = useTranslation();
  const { data: conversations = [] } = useGetConversationsQuery();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (c.id === currentConversationId) return false;
      if (!q) return true;
      const display = getDisplayConversation(c);
      return display.title.toLowerCase().includes(q);
    });
  }, [conversations, currentConversationId, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/30 sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-[#1c1c1e] sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={t("common.close")}
          >
            <Icon icon={IconClose} size={22} />
          </button>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">{t("forward.title")}</h2>
          <div className="w-9" />
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <Icon
              icon={IconSearch}
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("common.search")}
              className="w-full rounded-full bg-zinc-100 py-2.5 pl-9 pr-4 text-sm outline-none dark:bg-zinc-800 dark:text-white"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {filtered.map((conversation) => (
            <ForwardTargetRow
              key={conversation.id}
              conversation={conversation}
              onSelect={() => onForward(conversation.id, messages)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              {t("forward.empty")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ForwardTargetRow({
  conversation,
  onSelect,
}: {
  conversation: Conversation;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const display = getDisplayConversation(conversation);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
      )}
    >
      <ChatAvatar conversation={display} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-zinc-900 dark:text-white">{display.title}</p>
        <p className="truncate text-sm text-zinc-500">
          {conversation.lastMessage?.content ?? conversation.category ?? t("forward.fallback")}
        </p>
      </div>
    </button>
  );
}
