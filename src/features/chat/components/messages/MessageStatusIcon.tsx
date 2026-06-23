import { useTranslation } from "react-i18next";
import { Icon, IconCheck, IconCheckDone } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { MessageStatus } from "@/types/chat";

interface MessageStatusIconProps {
  status: MessageStatus;
  className?: string;
}

export function MessageStatusIcon({ status, className }: MessageStatusIconProps) {
  const { t } = useTranslation();

  if (status === "read") {
    return (
      <Icon
        icon={IconCheckDone}
        size={14}
        className={cn("text-[#00bbff]", className)}
        aria-label={t("message.status.read")}
      />
    );
  }

  if (status === "delivered") {
    return (
      <Icon
        icon={IconCheckDone}
        size={14}
        className={cn("text-zinc-400", className)}
        aria-label={t("message.status.delivered")}
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
