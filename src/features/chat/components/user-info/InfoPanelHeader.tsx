import { useTranslation } from "react-i18next";
import { Icon, IconChevronBack, IconClose, IconPencil } from "@/components/icons";

interface InfoPanelHeaderProps {
  title: string;
  onClose: () => void;
  showEdit?: boolean;
  onEdit?: () => void;
  mobileBack?: boolean;
}

export function InfoPanelHeader({
  title,
  onClose,
  showEdit,
  onEdit,
  mobileBack = true,
}: InfoPanelHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="relative flex shrink-0 items-center justify-center border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-700/80">
      <button
        type="button"
        onClick={onClose}
        className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full text-[#00bbff] transition hover:bg-zinc-200/80 md:left-3 md:h-9 md:w-9 md:text-zinc-500 dark:hover:bg-zinc-800 dark:md:text-zinc-400"
        aria-label={mobileBack ? t("common.back") : t("common.close")}
      >
        {mobileBack ? (
          <>
            <Icon icon={IconChevronBack} size={24} className="md:hidden" />
            <Icon icon={IconClose} size={22} className="hidden md:block" />
          </>
        ) : (
          <Icon icon={IconClose} size={22} />
        )}
      </button>

      <h2 className="text-[17px] font-semibold text-zinc-900 dark:text-white">{title}</h2>

      {showEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label={t("common.edit")}
        >
          <Icon icon={IconPencil} size={20} />
        </button>
      )}
    </header>
  );
}
