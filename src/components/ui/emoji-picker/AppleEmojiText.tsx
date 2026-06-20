import { cn } from "@/lib/utils";
import { isEmojiSegment, splitTextAndEmoji } from "@/lib/apple-emoji";
import { AppleEmoji } from "./AppleEmoji";

interface AppleEmojiTextProps {
  text: string;
  emojiSize?: number;
  className?: string;
}

export function AppleEmojiText({
  text,
  emojiSize = 20,
  className,
}: AppleEmojiTextProps) {
  const parts = splitTextAndEmoji(text);

  return (
    <span className={cn("inline whitespace-pre-wrap break-words", className)}>
      {parts.map((part, index) =>
        isEmojiSegment(part) ? (
          <AppleEmoji
            key={`${index}-${part}`}
            emoji={part}
            size={emojiSize}
            className="mx-[0.02em] inline-block align-[-0.15em]"
          />
        ) : (
          <span key={`${index}-text`}>{part}</span>
        ),
      )}
    </span>
  );
}
