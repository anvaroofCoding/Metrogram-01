import { cn } from "@/lib/utils";
import type { MessageReplyQuote } from "@/types/chat";

interface MessageReplyQuoteProps {
  quote: MessageReplyQuote;
  variant: "sent" | "received";
  onClick?: () => void;
  className?: string;
}

export function MessageReplyQuoteView({
  quote,
  variant,
  onClick,
  className,
}: MessageReplyQuoteProps) {
  const accent = variant === "sent" ? "border-[#00bbff]" : "border-violet-500";
  const titleColor = variant === "sent" ? "text-[#00bbff]" : "text-violet-600 dark:text-violet-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mb-1 flex w-full min-w-0 cursor-pointer gap-2 rounded-lg border-l-[3px] bg-black/[0.04] px-2.5 py-1.5 text-left transition hover:bg-black/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.09]",
        accent,
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-xs font-semibold", titleColor)}>
          {quote.senderName ?? "User"}
        </p>
        <p className="truncate text-sm text-zinc-600 dark:text-zinc-300">
          {quote.content}
        </p>
      </div>
    </button>
  );
}
