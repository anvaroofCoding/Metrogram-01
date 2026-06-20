import { cn } from "@/lib/utils";
import { getAppleEmojiSrc } from "@/lib/apple-emoji";

interface AppleEmojiProps {
  emoji: string;
  size?: number;
  className?: string;
}

export function AppleEmoji({ emoji, size = 28, className }: AppleEmojiProps) {
  return (
    <img
      src={getAppleEmojiSrc(emoji)}
      alt={emoji}
      width={size}
      height={size}
      draggable={false}
      loading="lazy"
      className={cn("pointer-events-none shrink-0 select-none", className)}
    />
  );
}
