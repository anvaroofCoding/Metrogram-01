import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconCheckCircle, IconMore, IconTrash } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

interface ChatHeaderMenuProps {
  conversation: Conversation;
  onSelectMessages: () => void;
  onLeave?: () => void;
}

interface MenuRowProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

function MenuRow({ icon, label, onClick, destructive }: MenuRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] transition-colors",
        destructive
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-zinc-900 hover:bg-zinc-50 dark:text-white dark:hover:bg-zinc-800/60",
      )}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function ChatHeaderMenu({
  conversation,
  onSelectMessages,
  onLeave,
}: ChatHeaderMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const canLeave =
    (conversation.category === "group" || conversation.category === "channel") &&
    Boolean(onLeave);
  const leaveLabel =
    conversation.category === "channel"
      ? t("chat.header.leaveChannel")
      : t("chat.header.leaveGroup");

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
          open && "bg-zinc-100 dark:bg-zinc-800",
        )}
        aria-label={t("chat.header.more")}
        aria-expanded={open}
      >
        <Icon icon={IconMore} size={22} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-[calc(100%+6px)] z-50 min-w-[220px] overflow-hidden rounded-2xl py-1",
            "border border-zinc-200/80 bg-white shadow-xl",
            "dark:border-zinc-700 dark:bg-[#212121]",
          )}
        >
          <MenuRow
            icon={<Icon icon={IconCheckCircle} size={20} />}
            label={t("chat.header.selectMessages")}
            onClick={() => {
              setOpen(false);
              onSelectMessages();
            }}
          />
          {canLeave && (
            <MenuRow
              icon={<Icon icon={IconTrash} size={20} />}
              label={leaveLabel}
              destructive
              onClick={() => {
                setOpen(false);
                onLeave?.();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
