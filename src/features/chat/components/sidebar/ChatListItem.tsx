import { Icon, IconCheckDone, IconPin } from "@/components/icons";
import { usePeerPresence } from "@/features/chat/hooks/usePeerPresence";
import { useDisplayConversation } from "@/features/chat/hooks/useDisplayConversation";
import {
  getChatListPreview,
  getChatListTimeLabel,
  isLastMessageOwn,
} from "@/features/chat/lib/chat-list-display";
import { resolveOutgoingStatus } from "@/features/chat/lib/message-status";
import { getDisplayUnreadCount } from "@/features/chat/lib/unread-count";
import { MessageStatusIcon } from "@/features/chat/components/messages/MessageStatusIcon";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";
import { ChatAvatar } from "./ChatAvatar";

interface ChatListItemProps {
  conversation: Conversation;
  selected?: boolean;
  onClick: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}

export function ChatListItem({
  conversation,
  selected,
  onClick,
  onContextMenu,
}: ChatListItemProps) {
  const display = useDisplayConversation(conversation);
  const { isTyping } = usePeerPresence(conversation);
  const unreadCount = getDisplayUnreadCount(conversation);
  const hasUnread = unreadCount > 0;
  const isPersonal = conversation.category === "personal" || !conversation.category;
  const preview = getChatListPreview(conversation, isTyping && isPersonal);
  const timeLabel = getChatListTimeLabel(conversation);
  const lastMessageOwn = isLastMessageOwn(conversation);
  const outgoingStatus =
    lastMessageOwn && conversation.lastMessage
      ? resolveOutgoingStatus(conversation.lastMessage, conversation.peerLastReadAt)
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-[10px] text-left transition-colors",
        selected
          ? "bg-[#00bbff] text-white"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
      )}
    >
      <ChatAvatar conversation={display} selected={selected} size="list" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            {conversation.isPinned && !selected && (
              <Icon icon={IconPin} size={14} className="shrink-0 text-zinc-400" />
            )}
            <span
              className={cn(
                "truncate text-[16px] leading-5",
                selected
                  ? "font-semibold text-white"
                  : hasUnread
                    ? "font-semibold text-zinc-900 dark:text-white"
                    : "font-medium text-zinc-900 dark:text-white",
              )}
            >
              {display.title}
            </span>
            {conversation.isVerified && (
              <Icon
                icon={IconCheckDone}
                size={15}
                className={cn(
                  "shrink-0",
                  selected ? "text-white" : "text-[#00bbff]",
                )}
              />
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {lastMessageOwn && outgoingStatus && (
              <MessageStatusIcon
                status={outgoingStatus}
                className={selected ? "text-white/90" : undefined}
              />
            )}
            <span
              className={cn(
                "text-[13px] leading-4 tabular-nums",
                selected
                  ? "text-white/90"
                  : hasUnread
                    ? "text-[#00bbff]"
                    : "text-zinc-400 dark:text-zinc-500",
              )}
            >
              {timeLabel}
            </span>
          </div>
        </div>

        <div className="mt-0.5 flex items-center gap-2">
          <p
            className={cn(
              "min-w-0 flex-1 truncate text-[14px] leading-[18px]",
              selected
                ? isTyping && isPersonal
                  ? "text-white"
                  : "text-white/85"
                : isTyping && isPersonal
                  ? "text-[#00bbff]"
                  : hasUnread
                    ? "font-medium text-zinc-700 dark:text-zinc-200"
                    : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            {preview}
          </p>

          {hasUnread && !selected && (
            <span className="flex h-[22px] min-w-[22px] shrink-0 items-center justify-center rounded-full bg-[#00bbff] px-1.5 text-[12px] font-semibold leading-none text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

          {hasUnread && selected && (
            <span className="flex h-[22px] min-w-[22px] shrink-0 items-center justify-center rounded-full bg-white px-1.5 text-[12px] font-semibold leading-none text-[#00bbff]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
