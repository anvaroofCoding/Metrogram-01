import { AppleEmoji } from "@/components/ui/emoji-picker/AppleEmoji";
import { QUICK_REACTIONS } from "@/features/chat/lib/reactions";
import { cn } from "@/lib/utils";

interface MessageQuickReactionBarProps {
  onPick: (emoji: string) => void;
  className?: string;
}

export function MessageQuickReactionBar({ onPick, className }: MessageQuickReactionBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-zinc-200/80 bg-white px-2 py-1.5 shadow-lg dark:border-zinc-600 dark:bg-[#2c2c2e]",
        className,
      )}
    >
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onPick(emoji)}
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-zinc-100 dark:hover:bg-zinc-700"
          aria-label={`Reaksiya ${emoji}`}
        >
          <AppleEmoji emoji={emoji} size={22} />
        </button>
      ))}
      <span className="ml-0.5 flex h-8 w-6 items-center justify-center text-zinc-400">⌄</span>
    </div>
  );
}
