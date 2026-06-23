import { useTranslation } from "react-i18next";
import { Icon, IconClose, IconPin } from "@/components/icons";
import { AppleEmojiText } from "@/components/ui/emoji-picker/AppleEmojiText";
import { cn } from "@/lib/utils";
import type { PinnedMessageInfo } from "@/types/chat";

interface PinnedMessageBarProps {
  pinned: PinnedMessageInfo;
  onClick?: () => void;
  onUnpin: () => void;
  className?: string;
}

export function PinnedMessageBar({
  pinned,
  onClick,
  onUnpin,
  className,
}: PinnedMessageBarProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "mx-4 mt-2 flex items-center gap-3 rounded-full border border-zinc-200/80 bg-white px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-800",
        className,
      )}
    >
      <Icon icon={IconPin} size={18} className="shrink-0 text-zinc-400" />
      <button
        type="button"
        onClick={onClick}
        className="min-w-0 flex-1 border-l-2 border-[#00bbff] pl-3 text-left"
      >
        <p className="text-xs font-semibold text-[#00bbff]">{t("message.pinned.label")}</p>
        <p className="truncate text-sm text-zinc-700 dark:text-zinc-200">
          <AppleEmojiText text={pinned.content} emojiSize={16} />
        </p>
      </button>
      <button
        type="button"
        onClick={onUnpin}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-700"
        aria-label={t("message.pinned.unpin")}
      >
        <Icon icon={IconClose} size={18} />
      </button>
    </div>
  );
}
