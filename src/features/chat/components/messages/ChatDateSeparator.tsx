import { cn } from "@/lib/utils";

interface ChatDateSeparatorProps {
  label: string;
  dateKey: string;
  onClick?: () => void;
  className?: string;
}

export function ChatDateSeparator({
  label,
  dateKey,
  onClick,
  className,
}: ChatDateSeparatorProps) {
  return (
    <div
      id={`chat-date-${dateKey}`}
      className={cn("flex justify-center py-2", className)}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition",
          "bg-[#00bbff]/15 text-[#0088cc]",
          "hover:bg-[#00bbff]/25 dark:bg-[#00bbff]/20 dark:text-[#5cd4ff]",
        )}
      >
        {label}
      </button>
    </div>
  );
}
