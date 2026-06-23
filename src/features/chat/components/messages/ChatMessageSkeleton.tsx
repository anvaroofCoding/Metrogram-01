import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const RECEIVED_WIDTHS = ["w-[52%]", "w-[68%]", "w-[44%]", "w-[58%]"];
const SENT_WIDTHS = ["w-[48%]", "w-[62%]", "w-[36%]"];

interface ChatMessageSkeletonProps {
  className?: string;
}

function BubbleSkeleton({
  align,
  widthClass,
}: {
  align: "left" | "right";
  widthClass: string;
}) {
  return (
    <div className={cn("flex", align === "right" ? "justify-end" : "justify-start")}>
      <Skeleton
        className={cn(
          "h-10 rounded-[20px]",
          widthClass,
          align === "left" && "rounded-bl-[5px]",
          align === "right" && "rounded-br-[5px]",
        )}
      />
    </div>
  );
}

export function ChatMessageSkeleton({ className }: ChatMessageSkeletonProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn("space-y-4", className)}
      role="status"
      aria-label={t("chat.skeleton.messages")}
    >
      <div className="space-y-2">
        <BubbleSkeleton align="left" widthClass={RECEIVED_WIDTHS[0]} />
        <BubbleSkeleton align="left" widthClass={RECEIVED_WIDTHS[1]} />
      </div>

      <div className="space-y-2">
        <BubbleSkeleton align="right" widthClass={SENT_WIDTHS[0]} />
        <BubbleSkeleton align="right" widthClass={SENT_WIDTHS[1]} />
      </div>

      <BubbleSkeleton align="left" widthClass={RECEIVED_WIDTHS[2]} />
    </div>
  );
}
