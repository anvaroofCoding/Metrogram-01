import { Link } from "react-router-dom";
import { AppleEmojiText } from "@/components/ui/emoji-picker/AppleEmojiText";
import { getInviteJoinPath, linkifyInviteLinks } from "@/lib/invite-links";
import { cn } from "@/lib/utils";

interface LinkifiedMessageTextProps {
  text: string;
  emojiSize?: number;
  className?: string;
}

export function LinkifiedMessageText({
  text,
  emojiSize = 20,
  className,
}: LinkifiedMessageTextProps) {
  const parts = linkifyInviteLinks(text);
  const hasInvite = parts.some((part) => part.type === "invite");

  if (!hasInvite) {
    return <AppleEmojiText text={text} emojiSize={emojiSize} className={className} />;
  }

  return (
    <span className={cn("inline whitespace-pre-wrap break-words", className)}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <AppleEmojiText
              key={`text-${index}`}
              text={part.value}
              emojiSize={emojiSize}
            />
          );
        }

        const joinPath = getInviteJoinPath(part.value);
        if (!joinPath) {
          return <span key={`invite-${index}`}>{part.value}</span>;
        }

        return (
          <Link
            key={`invite-${index}`}
            to={joinPath}
            className="text-[#00bbff] underline decoration-[#00bbff]/40 underline-offset-2 hover:decoration-[#00bbff]"
          >
            {part.value}
          </Link>
        );
      })}
    </span>
  );
}
