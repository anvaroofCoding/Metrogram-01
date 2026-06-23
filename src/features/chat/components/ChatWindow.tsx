import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Composer } from "@/components/ui/composer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { UploadedFile } from "@/components/ui/file-preview";
import { uploadAttachment, uploadAttachments, sanitizeMessageAttachment } from "@/lib/uploads";
import type { VoiceRecordingResult } from "@/hooks/useVoiceRecorder";

import {
  getCurrentUserIdForChat,
  useBulkDeleteMessagesMutation,
  useDeleteMessageMutation,
  useGetMessagesQuery,
  useMarkConversationReadMutation,
  usePinMessageMutation,
  useSendMessageMutation,
  useToggleReactionMutation,
  useRecordMessageViewsMutation,
  useUnpinMessageMutation,
  useUpdateMessageMutation,
} from "@/features/chat/api/chatApi";
import { downloadMediaUrl } from "@/lib/files";
import { getFirstDownloadableAttachment } from "@/features/chat/lib/reactions";

import { ChatEmptyState } from "@/features/chat/components/messages/ChatEmptyState";
import { ChatDateSeparator } from "@/features/chat/components/messages/ChatDateSeparator";
import { ChatMessageRenderer } from "@/features/chat/components/messages/ChatMessageRenderer";
import { ChatMessageSkeleton } from "@/features/chat/components/messages/ChatMessageSkeleton";
import { ComposerActionBar } from "@/features/chat/components/messages/ComposerActionBar";
import { ForwardMessageModal } from "@/features/chat/components/messages/ForwardMessageModal";
import { MessageContextMenu } from "@/features/chat/components/messages/MessageContextMenu";
import { MessageSelectionBar } from "@/features/chat/components/messages/MessageSelectionBar";
import { PinMessageDialog } from "@/features/chat/components/messages/PinMessageDialog";
import { PinnedMessageBar } from "@/features/chat/components/messages/PinnedMessageBar";
import {
  formatDateSeparator,
  toDateKey,
} from "@/features/chat/lib/message-dates";
import type {
  ComposerDraft,
  MessageContextState,
  MessageMenuAction,
} from "@/features/chat/lib/message-actions";

import { useRealtime } from "@/realtime/RealtimeProvider";

import type { Message, PinnedMessageInfo } from "@/types/chat";

export interface ChatWindowActions {
  startSelection: () => void;
  cancelSelection: () => void;
}

interface ChatWindowProps {
  conversationId: string;
  contactName?: string;
  peerLastReadAt?: string | null;
  pinnedMessage?: PinnedMessageInfo;
  highlightedMessageId?: string | null;
  scrollToDateKey?: string | null;
  onScrollComplete?: () => void;
  onDateSeparatorClick?: (dateKey: string) => void;
  canCompose?: boolean;
  conversationCategory?: string;
  actionsRef?: React.MutableRefObject<ChatWindowActions | null>;
  onSelectionChange?: (state: { active: boolean; count: number }) => void;
}

type DeleteConfirmTarget =
  | { type: "single"; messageId: string }
  | { type: "bulk"; ids: string[] };

type TimelineItem =
  | { type: "date"; dateKey: string; label: string }
  | { type: "group"; variant: "sent" | "received"; messages: Message[] };

function buildTimeline(messages: Message[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  let lastDateKey = "";
  let lastGroup: Extract<TimelineItem, { type: "group" }> | null = null;

  for (const msg of messages) {
    const dateKey = toDateKey(msg.createdAt);
    if (dateKey !== lastDateKey) {
      if (lastGroup) {
        items.push(lastGroup);
        lastGroup = null;
      }
      items.push({
        type: "date",
        dateKey,
        label: formatDateSeparator(msg.createdAt),
      });
      lastDateKey = dateKey;
    }

    const variant =
      msg.senderId === getCurrentUserIdForChat() ? "sent" : "received";
    if (lastGroup && lastGroup.variant === variant) {
      lastGroup.messages.push(msg);
    } else {
      if (lastGroup) items.push(lastGroup);
      lastGroup = { type: "group", variant, messages: [msg] };
    }
  }

  if (lastGroup) items.push(lastGroup);
  return items;
}

export function ChatWindow({
  conversationId,
  contactName,
  peerLastReadAt,
  pinnedMessage,
  highlightedMessageId,
  scrollToDateKey,
  onScrollComplete,
  onDateSeparatorClick,
  canCompose = true,
  conversationCategory,
  actionsRef,
  onSelectionChange,
}: ChatWindowProps) {
  const { t } = useTranslation();
  const isChannel = conversationCategory === "channel";
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sendTyping } = useRealtime();

  const { data, isLoading } = useGetMessagesQuery({ conversationId });
  const { mutateAsync: sendMessage, isLoading: isSending } = useSendMessageMutation();
  const { mutateAsync: updateMessage } = useUpdateMessageMutation();
  const { mutateAsync: deleteMessage } = useDeleteMessageMutation();
  const { mutateAsync: bulkDelete } = useBulkDeleteMessagesMutation();
  const { mutateAsync: pinMessage } = usePinMessageMutation();
  const { mutateAsync: unpinMessage } = useUnpinMessageMutation();
  const { mutateAsync: toggleReaction } = useToggleReactionMutation();
  const { mutateAsync: recordMessageViews } = useRecordMessageViewsMutation();
  const { mutate: markRead } = useMarkConversationReadMutation();

  const recordedViewsRef = useRef<Set<string>>(new Set());

  const [isUploading, setIsUploading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [composerDraft, setComposerDraft] = useState<ComposerDraft | null>(null);
  const [composerValue, setComposerValue] = useState("");
  const [contextMenu, setContextMenu] = useState<MessageContextState | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [pinTarget, setPinTarget] = useState<Message | null>(null);
  const [forwardMessages, setForwardMessages] = useState<Message[]>([]);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmTarget | null>(null);

  const messages = data?.items ?? [];
  const isEmpty = !isLoading && messages.length === 0;
  const timeline = useMemo(() => buildTimeline(messages), [messages]);

  const contextMessage = useMemo(
    () => messages.find((m) => m.id === contextMenu?.messageId) ?? null,
    [contextMenu?.messageId, messages],
  );

  useEffect(() => {
    if (!actionsRef) return;
    actionsRef.current = {
      startSelection: () => {
        setSelectionMode(true);
        setSelectedIds(new Set());
      },
      cancelSelection: () => {
        setSelectionMode(false);
        setSelectedIds(new Set());
      },
    };
    return () => {
      actionsRef.current = null;
    };
  }, [actionsRef]);

  useEffect(() => {
    onSelectionChange?.({ active: selectionMode, count: selectedIds.size });
  }, [onSelectionChange, selectionMode, selectedIds.size]);

  useEffect(() => {
    markRead({ conversationId });
  }, [conversationId, markRead]);

  useEffect(() => {
    recordedViewsRef.current = new Set();
  }, [conversationId]);

  useEffect(() => {
    if (!isChannel || isLoading || messages.length === 0) return;
    const pending = messages
      .map((m) => m.id)
      .filter((id) => !recordedViewsRef.current.has(id));
    if (pending.length === 0) return;
    pending.forEach((id) => recordedViewsRef.current.add(id));
    void recordMessageViews({ messageIds: pending });
  }, [isChannel, isLoading, messages, recordMessageViews]);

  useEffect(() => {
    setComposerDraft(null);
    setComposerValue("");
    setContextMenu(null);
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  useEffect(() => {
    if (!highlightedMessageId) return;
    document.getElementById(`message-${highlightedMessageId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [highlightedMessageId]);

  useEffect(() => {
    if (!scrollToDateKey) return;
    document.getElementById(`chat-date-${scrollToDateKey}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    onScrollComplete?.();
  }, [scrollToDateKey, onScrollComplete]);

  const scrollToMessage = useCallback((messageId: string) => {
    document.getElementById(`message-${messageId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  const handleSubmit = useCallback(
    async (content: string, files?: UploadedFile[]) => {
      setSendError(null);
      const trimmed = content.trim();

      try {
        if (composerDraft?.mode === "edit") {
          if (!trimmed) return;
          await updateMessage({
            messageId: composerDraft.message.id,
            conversationId,
            content: trimmed,
          });
          setComposerDraft(null);
          setComposerValue("");
          return;
        }

        let attachments;
        if (files?.length) {
          setIsUploading(true);
          attachments = await uploadAttachments(
            files.map((f) => ({ file: f.file, name: f.name, kind: f.kind })),
          );
        }

        await sendMessage({
          conversationId,
          content: trimmed,
          attachments,
          clientId: `client-${Date.now()}`,
          replyToMessageId:
            composerDraft?.mode === "reply" ? composerDraft.message.id : undefined,
          forwardFromMessageId:
            composerDraft?.mode === "forward" ? composerDraft.message.id : undefined,
          forwardFromConversationId:
            composerDraft?.mode === "forward" ? conversationId : undefined,
        });

        setComposerDraft(null);
        setComposerValue("");
      } catch (err) {
        setSendError(err instanceof Error ? err.message : t("chat.sendFailed"));
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [composerDraft, conversationId, sendMessage, updateMessage],
  );

  const handleVoiceSubmit = useCallback(
    async (voice: VoiceRecordingResult) => {
      setSendError(null);
      try {
        setIsUploading(true);
        const uploaded = await uploadAttachment(voice.blob, "voice-message.webm");
        await sendMessage({
          conversationId,
          content: "",
          attachments: [
            sanitizeMessageAttachment({
              ...uploaded,
              duration: voice.duration,
              waveform: voice.waveform,
            }),
          ],
          clientId: `client-${Date.now()}`,
        });
      } catch (err) {
        setSendError(err instanceof Error ? err.message : t("chat.voiceSendFailed"));
      } finally {
        setIsUploading(false);
      }
    },
    [conversationId, sendMessage],
  );

  const handleContextMenu = useCallback((message: Message, x: number, y: number) => {
    setContextMenu({ messageId: message.id, x, y });
  }, []);

  const handleMenuAction = useCallback(
    async (action: MessageMenuAction, message: Message) => {
      switch (action) {
        case "delete":
          setDeleteConfirm({ type: "single", messageId: message.id });
          break;
        case "edit":
          setComposerDraft({ mode: "edit", message });
          setComposerValue(message.content);
          break;
        case "pin":
          setPinTarget(message);
          break;
        case "copy":
          if (message.content) {
            await navigator.clipboard.writeText(message.content);
          }
          break;
        case "reply":
          setComposerDraft({ mode: "reply", message });
          setComposerValue("");
          break;
        case "select":
          setSelectionMode(true);
          setSelectedIds(new Set([message.id]));
          break;
        case "forward":
          setForwardMessages([message]);
          setForwardOpen(true);
          break;
        case "download": {
          const attachment = getFirstDownloadableAttachment(message);
          if (attachment) {
            await downloadMediaUrl(attachment.url, attachment.name ?? "media");
          }
          break;
        }
      }
    },
    [conversationId],
  );

  const handleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      await toggleReaction({ messageId, emoji });
    },
    [toggleReaction],
  );

  const toggleSelect = useCallback((messageId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === "single") {
      await deleteMessage({ messageId: deleteConfirm.messageId, conversationId });
    } else {
      await bulkDelete({ conversationId, ids: deleteConfirm.ids });
      setSelectionMode(false);
      setSelectedIds(new Set());
    }

    setDeleteConfirm(null);
  }, [bulkDelete, conversationId, deleteConfirm, deleteMessage]);

  const handleBulkDeleteRequest = useCallback(() => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setDeleteConfirm({ type: "bulk", ids });
  }, [selectedIds]);

  const handleSelectionForward = useCallback(() => {
    const selected = messages.filter((m) => selectedIds.has(m.id));
    if (selected.length === 0) return;
    setForwardMessages(selected);
    setForwardOpen(true);
  }, [messages, selectedIds]);

  const handleForwardTo = useCallback(
    async (targetConversationId: string, toForward: Message[]) => {
      for (const message of toForward) {
        await sendMessage({
          conversationId: targetConversationId,
          content: message.content,
          attachments: message.attachments,
          clientId: `fwd-${message.id}-${Date.now()}`,
          forwardFromMessageId: message.id,
          forwardFromConversationId: conversationId,
        });
      }
      setForwardOpen(false);
      setForwardMessages([]);
      setSelectionMode(false);
      setSelectedIds(new Set());
    },
    [conversationId, sendMessage],
  );

  const handlePinConfirm = useCallback(
    async (pinForAll: boolean) => {
      if (!pinTarget) return;
      await pinMessage({
        conversationId,
        messageId: pinTarget.id,
        pinForAll,
      });
      setPinTarget(null);
    },
    [conversationId, pinMessage, pinTarget],
  );

  const handleChange = (value: string) => {
    setComposerValue(value);
    sendTyping(conversationId, value.length > 0);
  };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col overflow-x-hidden">
      {pinnedMessage && (
        <PinnedMessageBar
          pinned={pinnedMessage}
          onClick={() => scrollToMessage(pinnedMessage.id)}
          onUnpin={() => void unpinMessage({ conversationId })}
        />
      )}

      <div
        ref={scrollRef}
        className="chat-messages-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-white px-3 py-3 [--chat-surface:#ffffff] md:px-8 md:py-4 dark:bg-[#1e1e1e] dark:[--chat-surface:#1e1e1e]"
        onMouseDown={(event) => {
          if (selectionMode) return;
          const target = event.target as HTMLElement;
          if (
            target.closest(
              "button, a, input, textarea, .imessage-bubble, .code-block, video, img",
            )
          ) {
            return;
          }
          window.getSelection()?.removeAllRanges();
        }}
      >
        {isLoading ? (
          <ChatMessageSkeleton />
        ) : isEmpty ? (
          <ChatEmptyState />
        ) : (
          <div className="mt-auto space-y-4">
            {timeline.map((item, i) =>
              item.type === "date" ? (
                <ChatDateSeparator
                  key={`date-${item.dateKey}`}
                  dateKey={item.dateKey}
                  label={item.label}
                  onClick={() => onDateSeparatorClick?.(item.dateKey)}
                />
              ) : (
                <ChatMessageRenderer
                  key={`group-${i}`}
                  variant={item.variant}
                  messages={item.messages}
                  peerLastReadAt={peerLastReadAt}
                  highlightedMessageId={highlightedMessageId}
                  isChannel={isChannel}
                  selectionMode={selectionMode}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onContextMenu={handleContextMenu}
                  onReplyQuoteClick={scrollToMessage}
                  onToggleReaction={handleReaction}
                />
              ),
            )}
          </div>
        )}
      </div>

      {canCompose && (
        <footer className="safe-bottom min-w-0 shrink-0 px-2 pb-2 pt-1 md:px-4 md:pb-4 md:pt-2">
          {sendError && (
            <p className="mb-2 rounded-xl bg-red-500/10 px-3 py-2 text-center text-sm text-red-600 dark:text-red-400">
              {sendError}
            </p>
          )}
          {composerDraft && (
            <ComposerActionBar
              draft={composerDraft}
              contactName={contactName}
              onClose={() => {
                setComposerDraft(null);
                setComposerValue("");
              }}
            />
          )}
          <Composer
            className="min-w-0"
            value={composerValue}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onVoiceSubmit={handleVoiceSubmit}
            isLoading={isSending || isUploading}
            autoFocus
            placeholder={
              composerDraft?.mode === "edit" ? t("chat.composerEdit") : t("chat.composerDefault")
            }
          />
        </footer>
      )}

      {selectionMode && (
        <MessageSelectionBar
          count={selectedIds.size}
          onDelete={() => handleBulkDeleteRequest()}
          onForward={handleSelectionForward}
          onCancel={() => {
            setSelectionMode(false);
            setSelectedIds(new Set());
          }}
        />
      )}

      {contextMenu && contextMessage && (
        <MessageContextMenu
          message={contextMessage}
          x={contextMenu.x}
          y={contextMenu.y}
          peerLastReadAt={peerLastReadAt}
          onAction={(action) => void handleMenuAction(action, contextMessage)}
          onReaction={(emoji) => void handleReaction(contextMessage.id, emoji)}
          onClose={() => setContextMenu(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title={
          deleteConfirm?.type === "bulk"
            ? t("chat.deleteBulkTitle")
            : t("chat.deleteSingleTitle")
        }
        description={
          deleteConfirm?.type === "bulk"
            ? t("chat.deleteBulkDescription", { count: deleteConfirm.ids.length })
            : t("chat.deleteSingleDescription")
        }
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        danger
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <PinMessageDialog
        open={Boolean(pinTarget)}
        contactName={contactName}
        onClose={() => setPinTarget(null)}
        onConfirm={(pinForAll) => void handlePinConfirm(pinForAll)}
      />

      <ForwardMessageModal
        open={forwardOpen}
        messages={forwardMessages}
        currentConversationId={conversationId}
        onClose={() => {
          setForwardOpen(false);
          setForwardMessages([]);
        }}
        onForward={(targetId, msgs) => void handleForwardTo(targetId, msgs)}
      />
    </div>
  );
}
