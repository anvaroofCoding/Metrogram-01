import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconCheck, IconChevronForward, IconLanguage } from "@/components/icons";
import { cn } from "@/lib/utils";
import { LOCALE_LABELS, type AppLocale } from "@/i18n/config";
import { useAppLocale } from "@/i18n/useAppLocale";

interface LanguageMenuItemProps {
  icon: React.ReactNode;
  label: string;
  suffix?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function LanguageMenuItem({ icon, label, suffix, onClick, className }: LanguageMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mx-2 flex w-[calc(100%-1rem)] items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-colors",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
        className,
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-zinc-500 dark:text-zinc-400">
        {icon}
      </span>
      <span className="flex-1 text-[15px] text-zinc-900 dark:text-white">{label}</span>
      {suffix}
    </button>
  );
}

interface LanguagePickerProps {
  onClose?: () => void;
}

export function LanguagePicker({ onClose }: LanguagePickerProps) {
  const { t } = useTranslation();
  const { locale, setLocale, locales } = useAppLocale();
  const [open, setOpen] = useState(false);

  const handleSelect = (next: AppLocale) => {
    setLocale(next);
    setOpen(false);
    onClose?.();
  };

  return (
    <div className="relative pb-1">
      <LanguageMenuItem
        icon={<Icon icon={IconLanguage} size={22} />}
        label={t("language.title")}
        suffix={
          <span className="flex items-center gap-1 text-sm text-zinc-400">
            {LOCALE_LABELS[locale].split(" ")[0]}
            <Icon icon={IconChevronForward} size={16} />
          </span>
        }
        onClick={() => setOpen((prev) => !prev)}
      />

      {open && (
        <div
          className={cn(
            "absolute left-full top-0 z-10 ml-1 w-56 overflow-hidden rounded-2xl shadow-2xl",
            "bg-white dark:bg-[#212121]",
            "animate-in fade-in slide-in-from-left-2 duration-150",
          )}
        >
          {locales.map((code) => {
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={cn(
                  "mx-2 my-1 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  active
                    ? "bg-[#00bbff]/10 text-[#00bbff]"
                    : "text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-800/60",
                )}
              >
                <span className="flex-1 text-[15px]">{LOCALE_LABELS[code]}</span>
                {active && <Icon icon={IconCheck} size={18} className="text-[#00bbff]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
