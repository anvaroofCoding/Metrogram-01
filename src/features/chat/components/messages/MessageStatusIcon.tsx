import { Icon, IconCheck, IconCheckDone } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { MessageStatus } from "@/types/chat";

interface MessageStatusIconProps {
  status: MessageStatus;
  className?: string;
}

export function MessageStatusIcon({ status, className }: MessageStatusIconProps) {
  if (status === "read") {
    return (
      <Icon
        icon={IconCheckDone}
        size={14}
        className={cn("text-[#00bbff]", className)}
        aria-label="O'qilgan"
      />
    );
  }

  if (status === "delivered") {
    return (
      <Icon
        icon={IconCheckDone}
        size={14}
        className={cn("text-zinc-400", className)}
        aria-label="Yetkazilgan"
      />
    );
  }

  return (
    <Icon
      icon={IconCheck}
      size={14}
      className={cn(
        status === "sending" ? "text-zinc-300" : "text-zinc-400",
        className,
      )}
      aria-label={status === "sending" ? "Yuborilmoqda" : "Yuborilgan"}
    />
  );
}
