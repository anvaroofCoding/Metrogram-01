import "./message-bubble.css";

import { AppleEmojiText } from "@/components/ui/emoji-picker/AppleEmojiText";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  message: string;
  variant?: "sent" | "received";
  className?: string;
  children?: React.ReactNode;
}

export function MessageBubble({
  message,
  variant = "received",
  className,
  children,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "imessage-bubble whitespace-pre-wrap",
        variant === "sent" ? "imessage-from-me" : "imessage-from-them",
        className,
      )}
    >
      {children ?? <AppleEmojiText text={message} emojiSize={20} />}
    </div>
  );
}

export interface ChatMessageProps {
  timestamp?: string;
  messages: string[];
  variant?: "sent" | "received";
  className?: string;
  showTimestamp?: boolean;
}

export function ChatMessage({
  timestamp,
  messages,
  variant = "received",
  className,
  showTimestamp = true,
}: ChatMessageProps) {
  return (
    <div className={cn("flex flex-col", variant === "sent" && "items-end", className)}>
      <div className="flex flex-col">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} variant={variant} />
        ))}
      </div>

      {showTimestamp && timestamp && (
        <span
          className={cn(
            "mt-1 px-2 text-xs text-muted-foreground",
            variant === "sent" && "text-right",
          )}
        >
          {timestamp}
        </span>
      )}
    </div>
  );
}
