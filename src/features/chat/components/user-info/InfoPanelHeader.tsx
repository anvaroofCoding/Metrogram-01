import { Icon, IconClose, IconPencil } from "@/components/icons";

interface InfoPanelHeaderProps {
  title: string;
  onClose: () => void;
  showEdit?: boolean;
  onEdit?: () => void;
}

export function InfoPanelHeader({ title, onClose, showEdit, onEdit }: InfoPanelHeaderProps) {
  return (
    <header className="relative flex shrink-0 items-center justify-center px-4 py-3">
      <button
        type="button"
        onClick={onClose}
        className="absolute left-3 flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:bg-zinc-800"
        aria-label="Yopish"
      >
        <Icon icon={IconClose} size={22} />
      </button>

      <h2 className="text-[17px] font-semibold text-zinc-900 dark:text-white">{title}</h2>

      {showEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Tahrirlash"
        >
          <Icon icon={IconPencil} size={20} />
        </button>
      )}
    </header>
  );
}
