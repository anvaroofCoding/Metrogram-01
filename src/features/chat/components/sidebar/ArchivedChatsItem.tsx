import { Icon, IconArchive } from "@/components/icons";
import { cn } from "@/lib/utils";

interface ArchivedChatsItemProps {
  onClick?: () => void;
  className?: string;
}

export function ArchivedChatsItem({ onClick, className }: ArchivedChatsItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
        "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
        className,
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00bbff]/15">
        <Icon icon={IconArchive} size={22} className="text-[#00bbff]" />
      </div>
      <span className="flex-1 text-[15px] font-medium text-zinc-900 dark:text-white">
        Archived Chats
      </span>
      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
        0
      </span>
    </button>
  );
}
