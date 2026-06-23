import { useTranslation } from "react-i18next";
import { Icon, IconChevronBack } from "@/components/icons";
import { cn } from "@/lib/utils";

interface PanelShellProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export function PanelShell({
  title,
  onBack,
  children,
  className,
  subtitle,
}: PanelShellProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 flex flex-col overflow-hidden rounded-[28px]",
        "bg-[#f4f4f5] dark:bg-[#0f0f0f]",
        className,
      )}
    >
      <header className="flex shrink-0 items-center bg-white px-2 py-3 dark:bg-[#1e1e1e]">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label={t("common.back")}
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-[17px] font-semibold text-zinc-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="truncate px-2 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          )}
        </div>
        <div className="w-10" />
      </header>

      {children}
    </div>
  );
}
