import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DeleteCountdownBanner } from "@/components/ui/delete-countdown-banner";
import {
  useDeleteConversationMutation,
  useLeaveConversationMutation,
  useMarkConversationReadMutation,
  usePinConversationListMutation,
  useUnpinConversationListMutation,
} from "@/features/chat/api/chatApi";
import {
  filterVisibleConversations,
  getDisplayConversation,
} from "@/features/chat/lib/conversation-display";
import { sortConversationsForSidebar } from "@/features/chat/lib/sort-conversations";
import { getCurrentUserId } from "@/features/auth/auth-session";
import { formatMessagePreview } from "@/lib/parse-message-content";
import type { Contact, Conversation } from "@/types/chat";
import {
  ChatListContextMenu,
  type ChatListMenuAction,
} from "./ChatListContextMenu";
import { ChatListItem } from "./ChatListItem";

interface ChatListProps {
  conversations: Conversation[];
  contacts?: Contact[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  onConversationRemoved?: (conversationId: string) => void;
  activeCategory: string;
  search?: string;
}

const DELETE_COUNTDOWN_SECONDS = 5;

export function ChatList({
  conversations,
  contacts = [],
  selectedId,
  onSelect,
  onConversationRemoved,
  activeCategory,
  search = "",
}: ChatListProps) {
  const { t } = useTranslation();
  const q = search.trim().toLowerCase();
  const currentUserId = getCurrentUserId();

  const { mutateAsync: pinConversation } = usePinConversationListMutation();
  const { mutateAsync: unpinConversation } = useUnpinConversationListMutation();
  const { mutateAsync: leaveConversation } = useLeaveConversationMutation();
  const { mutateAsync: deleteConversation } = useDeleteConversationMutation();
  const { mutateAsync: markRead } = useMarkConversationReadMutation();

  const [contextMenu, setContextMenu] = useState<{
    conversation: Conversation;
    x: number;
    y: number;
  } | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState<Conversation | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);
  const [deleteSecondsLeft, setDeleteSecondsLeft] = useState(DELETE_COUNTDOWN_SECONDS);

  const handleContextMenu = useCallback(
    (conversation: Conversation, event: React.MouseEvent) => {
      event.preventDefault();
      setContextMenu({
        conversation,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [],
  );

  const handleMenuAction = useCallback(
    (action: ChatListMenuAction, conversation: Conversation) => {
      switch (action) {
        case "pin":
          void pinConversation({ conversationId: conversation.id });
          break;
        case "unpin":
          void unpinConversation({ conversationId: conversation.id });
          break;
        case "mark-read":
          void markRead({ conversationId: conversation.id });
          break;
        case "leave":
          setLeaveConfirm(conversation);
          break;
        case "delete":
          setPendingDelete(conversation);
          setDeleteSecondsLeft(DELETE_COUNTDOWN_SECONDS);
          break;
      }
    },
    [markRead, pinConversation, unpinConversation],
  );

  const handleLeaveConfirm = useCallback(async () => {
    if (!leaveConfirm) return;
    await leaveConversation({ conversationId: leaveConfirm.id });
    onConversationRemoved?.(leaveConfirm.id);
    setLeaveConfirm(null);
  }, [leaveConfirm, leaveConversation, onConversationRemoved]);

  const cancelPendingDelete = useCallback(() => {
    setPendingDelete(null);
    setDeleteSecondsLeft(DELETE_COUNTDOWN_SECONDS);
  }, []);

  useEffect(() => {
    if (!pendingDelete) return;

    if (deleteSecondsLeft <= 0) {
      const conversationId = pendingDelete.id;
      setPendingDelete(null);
      setDeleteSecondsLeft(DELETE_COUNTDOWN_SECONDS);
      void deleteConversation({ conversationId }).then(() => {
        onConversationRemoved?.(conversationId);
      });
      return;
    }

    const timer = window.setTimeout(() => {
      setDeleteSecondsLeft((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [deleteConversation, deleteSecondsLeft, onConversationRemoved, pendingDelete]);

  let visible =
    activeCategory === "all"
      ? filterVisibleConversations(conversations, currentUserId, contacts)
      : filterVisibleConversations(conversations, currentUserId, contacts).filter(
          (c) => c.category === activeCategory,
        );

  if (q) {
    visible = visible.filter((c) => {
      const display = getDisplayConversation(c, currentUserId, contacts);
      const preview = formatMessagePreview(c.lastMessage?.content ?? "");
      return (
        display.title.toLowerCase().includes(q) ||
        preview.toLowerCase().includes(q)
      );
    });
  }

  visible = sortConversationsForSidebar(visible);

  if (visible.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {q
            ? t("common.noResults")
            : t(`sidebar.empty.${activeCategory}`, { defaultValue: t("sidebar.empty.all") })}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {activeCategory === "channel"
            ? t("sidebar.empty.hintChannel")
            : activeCategory === "personal"
              ? t("sidebar.empty.hintPersonal")
              : t("sidebar.empty.hintDefault")}
        </p>
      </div>
    );
  }

  const leaveLabel =
    leaveConfirm?.category === "channel"
      ? t("sidebar.leave.channelTitle")
      : t("sidebar.leave.groupTitle");

  return (
    <>
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {visible.map((conv) => (
          <ChatListItem
            key={conv.id}
            conversation={conv}
            selected={selectedId === conv.id}
            onClick={() => onSelect(conv)}
            onContextMenu={(event) => handleContextMenu(conv, event)}
          />
        ))}
      </div>

      {contextMenu && (
        <ChatListContextMenu
          conversation={contextMenu.conversation}
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={(action) => handleMenuAction(action, contextMenu.conversation)}
          onClose={() => setContextMenu(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(leaveConfirm)}
        title={leaveLabel}
        description={
          leaveConfirm?.category === "channel"
            ? t("sidebar.leave.channelDescription")
            : t("sidebar.leave.groupDescription")
        }
        confirmLabel={t("sidebar.leave.confirm")}
        cancelLabel={t("common.cancel")}
        danger
        onCancel={() => setLeaveConfirm(null)}
        onConfirm={() => void handleLeaveConfirm()}
      />

      <DeleteCountdownBanner
        open={Boolean(pendingDelete)}
        title={t("sidebar.deleteCountdown", {
          title: pendingDelete?.title ?? t("sidebar.deleteFallback"),
        })}
        secondsLeft={deleteSecondsLeft}
        onCancel={cancelPendingDelete}
      />
    </>
  );
}
