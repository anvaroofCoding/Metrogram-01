import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const NAME_WIDTHS = ["w-[58%]", "w-[72%]", "w-[48%]", "w-[65%]", "w-[55%]", "w-[70%]", "w-[52%]", "w-[62%]"];
const PREVIEW_WIDTHS = ["w-[82%]", "w-[68%]", "w-[90%]", "w-[74%]", "w-[85%]", "w-[60%]", "w-[78%]", "w-[88%]"];

interface ChatListSkeletonProps {
  count?: number;
  showMeta?: boolean;
  showCheckbox?: boolean;
}

function ChatListItemSkeleton({
  index,
  showMeta,
  showCheckbox,
}: {
  index: number;
  showMeta: boolean;
  showCheckbox: boolean;
}) {
  const nameWidth = NAME_WIDTHS[index % NAME_WIDTHS.length];
  const previewWidth = PREVIEW_WIDTHS[index % PREVIEW_WIDTHS.length];
  const showBadge = index % 3 === 0;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />

      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className={cn("h-4", nameWidth)} />
        <Skeleton className={cn("h-3.5", previewWidth)} />
      </div>

      {(showMeta || showCheckbox) && (
        <div className="flex shrink-0 flex-col items-end gap-2">
          {showMeta ? (
            <>
              <Skeleton className="h-3 w-10" />
              {showBadge ? (
                <Skeleton className="h-5 w-5 rounded-full" />
              ) : (
                <Skeleton className="h-4 w-4 rounded-sm" />
              )}
            </>
          ) : (
            <Skeleton className="h-[22px] w-[22px] rounded-md" />
          )}
        </div>
      )}
    </div>
  );
}

export function ChatListSkeleton({
  count = 8,
  showMeta = true,
  showCheckbox = false,
}: ChatListSkeletonProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex-1 overflow-hidden"
      role="status"
      aria-label={t("chat.skeleton.list")}
    >
      {Array.from({ length: count }, (_, i) => (
        <ChatListItemSkeleton
          key={i}
          index={i}
          showMeta={showMeta}
          showCheckbox={showCheckbox}
        />
      ))}
    </div>
  );
}
