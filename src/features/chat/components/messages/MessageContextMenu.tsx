import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Icon,
  IconCheckDone,
  IconCopy,
  IconDownload,
  IconForward,
  IconPencil,
  IconPin,
  IconReply,
  IconSelect,
  IconTrash,
} from "@/components/icons";
import { MessageQuickReactionBar } from "@/features/chat/components/messages/MessageQuickReactionBar";
import { resolveOutgoingStatus } from "@/features/chat/lib/message-status";
import type { MessageMenuAction } from "@/features/chat/lib/message-actions";
import { messageHasDownloadableMedia } from "@/features/chat/lib/reactions";
import { MessageStatusIcon } from "@/features/chat/components/messages/MessageStatusIcon";
import { getIntlLocale } from "@/i18n/config";
import { useAppLocale } from "@/i18n/useAppLocale";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import { getCurrentUserIdForChat } from "@/features/chat/api/chatApi";

interface MessageContextMenuProps {
  message: Message;
  x: number;
  y: number;
  peerLastReadAt?: string | null;
  onAction: (action: MessageMenuAction) => void;
  onReaction: (emoji: string) => void;
  onClose: () => void;
}

function formatMenuDate(iso: string, intlLocale: string): string {
  const date = new Date(iso);
  return date.toLocaleString(intlLocale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageContextMenu({
  message,
  x,
  y,
  peerLastReadAt,
  onAction,
  onReaction,
  onClose,
}: MessageContextMenuProps) {
  const { t } = useTranslation();
  const { locale } = useAppLocale();
  const intlLocale = getIntlLocale(locale);
  const ref = useRef<HTMLDivElement>(null);
  const isOwn = message.senderId === getCurrentUserIdForChat();
  const status = isOwn ? resolveOutgoingStatus(message, peerLastReadAt) : null;

  const menuItems = useMemo(
    (): Array<{
      action: MessageMenuAction;
      labelKey: string;
      icon: typeof IconTrash;
      danger?: boolean;
      show?: (message: Message, isOwn: boolean) => boolean;
    }> => [
      { action: "reply", labelKey: "message.menu.reply", icon: IconReply },
      { action: "pin", labelKey: "message.menu.pin", icon: IconPin },
      {
        action: "download",
        labelKey: "message.menu.download",
        icon: IconDownload,
        show: (msg) => messageHasDownloadableMedia(msg),
      },
      { action: "forward", labelKey: "message.menu.forward", icon: IconForward },
      { action: "select", labelKey: "message.menu.select", icon: IconSelect },
      { action: "delete", labelKey: "message.menu.delete", icon: IconTrash, danger: true },
      {
        action: "edit",
        labelKey: "message.menu.edit",
        icon: IconPencil,
        show: (_msg, own) => own,
      },
      {
        action: "copy",
        labelKey: "message.menu.copy",
        icon: IconCopy,
        show: (msg) => Boolean(msg.content.trim()),
      },
    ],
    [],
  );

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current?.contains(event.target as Node)) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    el.style.left = `${Math.min(x, maxX)}px`;
    el.style.top = `${Math.min(y, maxY)}px`;
  }, [x, y]);

  const visibleItems = menuItems.filter(
    (item) => item.show?.(message, isOwn) ?? true,
  );

  return (
    <div
      ref={ref}
      className="fixed z-[100] flex flex-col items-start gap-2"
      style={{ left: x, top: y }}
    >
      <MessageQuickReactionBar
        onPick={(emoji) => {
          onReaction(emoji);
          onClose();
        }}
      />

      <div
        className="min-w-[220px] overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-700 dark:bg-[#2c2c2e]"
        role="menu"
      >
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-700">
          {status && <MessageStatusIcon status={status} className="text-zinc-400" />}
          {!status && isOwn && (
            <Icon icon={IconCheckDone} size={14} className="text-zinc-300" />
          )}
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatMenuDate(message.createdAt, intlLocale)}
          </span>
        </div>

        <div className="py-1">
          {visibleItems.map((item) => (
            <button
              key={item.action}
              type="button"
              role="menuitem"
              onClick={() => {
                onAction(item.action);
                onClose();
              }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] transition hover:bg-zinc-50 dark:hover:bg-zinc-800/80",
                item.danger
                  ? "text-red-500"
                  : "text-zinc-800 dark:text-zinc-100",
              )}
            >
              <Icon
                icon={item.icon}
                size={20}
                className={item.danger ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"}
              />
              {t(item.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
