import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconCall, IconChevronBack, IconSearch } from "@/components/icons";
import { ChatHeaderMenu } from "@/features/chat/components/chat-header/ChatHeaderMenu";
import { usePeerPresence } from "@/features/chat/hooks/usePeerPresence";
import { useDisplayConversation } from "@/features/chat/hooks/useDisplayConversation";
import { getChannelMemberStats } from "@/features/chat/lib/conversation-members";
import { useGetContactsQuery } from "@/features/users/api/usersApi";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";
import { ChatAvatar } from "../sidebar/ChatAvatar";

interface ChatHeaderBarProps {
  conversation: Conversation;
  onInfoClick?: () => void;
  onSearchClick?: () => void;
  onSelectMessages?: () => void;
  onLeave?: () => void;
  selectionMode?: boolean;
  selectedCount?: number;
  onCancelSelection?: () => void;
  className?: string;
}

export function ChatHeaderBar({
  conversation,
  onInfoClick,
  onSearchClick,
  onSelectMessages,
  onLeave,
  selectionMode = false,
  selectedCount = 0,
  onCancelSelection,
  className,
}: ChatHeaderBarProps) {
  const { t } = useTranslation();
  const display = useDisplayConversation(conversation);
  const isChannel = conversation.category === "channel";
  const { statusLabel, isTyping } = usePeerPresence(conversation);
  const { data: contacts = [] } = useGetContactsQuery(
    {},
    { skip: !isChannel, pollingInterval: 8000 },
  );

  const subtitle = useMemo(() => {
    if (isChannel) {
      return getChannelMemberStats(conversation, contacts);
    }
    return statusLabel;
  }, [isChannel, conversation, contacts, statusLabel]);

  if (selectionMode) {
    return (
      <header
        className={cn(
          "mx-4 mt-4 flex items-center justify-between gap-3 rounded-full px-3 py-2.5",
          "bg-white dark:bg-[#212121]",
          className,
        )}
      >
        <button
          type="button"
          onClick={onCancelSelection}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label={t("chat.header.cancel")}
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>
        <span className="flex-1 text-center text-[15px] font-semibold text-zinc-900 dark:text-white">
          {selectedCount > 0
            ? t("selection.count", { count: selectedCount })
            : t("chat.header.selectMessages")}
        </span>
        <div className="w-10" />
      </header>
    );
  }

  return (
    <header
      className={cn(
        "mx-4 mt-4 flex items-center justify-between gap-3 rounded-full px-4 py-2.5",
        "bg-white dark:bg-[#212121]",
        className,
      )}
    >
      <button
        type="button"
        onClick={onInfoClick}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <ChatAvatar conversation={display} size="lg" />
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold text-zinc-900 dark:text-white">
            {display.title}
          </h2>
          <p
            className={cn(
              "truncate text-xs",
              isTyping && !isChannel
                ? "text-[#00bbff]"
                : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            {subtitle}
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label={t("chat.header.call")}
        >
          <Icon icon={IconCall} size={22} />
        </button>
        <button
          type="button"
          onClick={onSearchClick}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label={t("chat.header.search")}
        >
          <Icon icon={IconSearch} size={22} />
        </button>
        <ChatHeaderMenu
          conversation={conversation}
          onSelectMessages={() => onSelectMessages?.()}
          onLeave={onLeave}
        />
      </div>
    </header>
  );
}
