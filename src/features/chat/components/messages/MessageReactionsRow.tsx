import { AppleEmoji } from "@/components/ui/emoji-picker/AppleEmoji";
import { getCurrentUserIdForChat } from "@/features/chat/api/chatApi";
import { getUserReactionEmoji } from "@/features/chat/lib/reactions";
import { cn } from "@/lib/utils";
import type { MessageReaction } from "@/types/chat";

interface MessageReactionsRowProps {
  reactions?: MessageReaction[];
  onToggle?: (emoji: string) => void;
  className?: string;
}

export function MessageReactionsRow({
  reactions,
  onToggle,
  className,
}: MessageReactionsRowProps) {
  if (!reactions?.length) return null;

  const currentUserId = getCurrentUserIdForChat();
  const myEmoji = getUserReactionEmoji(reactions, currentUserId);

  return (
    <div className={cn("flex flex-wrap gap-1.5 px-1", className)}>
      {reactions.map((reaction) => {
        const isMine = reaction.emoji === myEmoji;
        return (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => onToggle?.(reaction.emoji)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm transition",
              isMine
                ? "bg-[#00bbff]/20 text-[#00bbff] ring-1 ring-[#00bbff]/40"
                : "bg-[#00bbff]/10 text-[#0077aa] hover:bg-[#00bbff]/15 dark:text-[#7dd3fc]",
            )}
          >
            <AppleEmoji emoji={reaction.emoji} size={16} />
            <span className="text-xs font-semibold tabular-nums">{reaction.count}</span>
          </button>
        );
      })}
    </div>
  );
}
