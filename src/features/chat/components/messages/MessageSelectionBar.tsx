import { Icon, IconForward, IconTrash } from "@/components/icons";

interface MessageSelectionBarProps {
  count: number;
  onDelete: () => void;
  onForward: () => void;
  onCancel: () => void;
}

export function MessageSelectionBar({
  count,
  onDelete,
  onForward,
  onCancel,
}: MessageSelectionBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-[90] mx-auto flex w-[min(92%,420px)] items-center justify-between rounded-full border border-zinc-200/80 bg-white px-4 py-3 shadow-xl dark:border-zinc-700 dark:bg-[#2c2c2e]">
      <button
        type="button"
        onClick={onDelete}
        disabled={count === 0}
        className="flex h-10 w-10 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-500/10"
        aria-label="O'chirish"
      >
        <Icon icon={IconTrash} size={22} />
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="text-sm font-medium text-zinc-600 dark:text-zinc-300"
      >
        {count} message{count === 1 ? "" : "s"}
      </button>

      <button
        type="button"
        onClick={onForward}
        disabled={count === 0}
        className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-700"
        aria-label="Forward"
      >
        <Icon icon={IconForward} size={22} />
      </button>
    </div>
  );
}
