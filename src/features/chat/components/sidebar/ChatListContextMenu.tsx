import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Icon,
  IconCheckDone,
  IconLogOut,
  IconPin,
  IconTrash,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

export type ChatListMenuAction = "pin" | "unpin" | "mark-read" | "leave" | "delete";

interface ChatListContextMenuProps {
  conversation: Conversation;
  x: number;
  y: number;
  onAction: (action: ChatListMenuAction) => void;
  onClose: () => void;
}

export function ChatListContextMenu({
  conversation,
  x,
  y,
  onAction,
  onClose,
}: ChatListContextMenuProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const menuItems = useMemo(
    (): Array<{
      action: ChatListMenuAction;
      labelKey: string;
      icon: typeof IconPin;
      danger?: boolean;
      show?: (conv: Conversation) => boolean;
    }> => [
      {
        action: "pin",
        labelKey: "sidebar.menu.pin",
        icon: IconPin,
        show: (c) => !c.isPinned,
      },
      {
        action: "unpin",
        labelKey: "sidebar.menu.unpin",
        icon: IconPin,
        show: (c) => Boolean(c.isPinned),
      },
      {
        action: "mark-read",
        labelKey: "sidebar.menu.markRead",
        icon: IconCheckDone,
        show: (c) => (c.unreadCount ?? 0) > 0,
      },
      {
        action: "leave",
        labelKey: "sidebar.menu.leaveChannel",
        icon: IconLogOut,
        danger: true,
        show: (c) => c.category === "channel",
      },
      {
        action: "leave",
        labelKey: "sidebar.menu.leaveGroup",
        icon: IconLogOut,
        danger: true,
        show: (c) => c.category === "group",
      },
      {
        action: "delete",
        labelKey: "sidebar.menu.deleteChat",
        icon: IconTrash,
        danger: true,
        show: (c) => c.category === "personal" || !c.category,
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
    (item) => item.show?.(conversation) ?? true,
  );

  return (
    <div
      ref={ref}
      className="fixed z-[100] min-w-[220px] overflow-hidden rounded-2xl border border-zinc-200/80 bg-white py-1 shadow-2xl dark:border-zinc-700 dark:bg-[#2c2c2e]"
      style={{ left: x, top: y }}
      role="menu"
    >
      {visibleItems.map((item) => (
        <button
          key={`${item.action}-${item.labelKey}`}
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
  );
}
