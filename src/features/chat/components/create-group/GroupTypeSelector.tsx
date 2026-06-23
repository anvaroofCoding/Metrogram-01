import { useTranslation } from "react-i18next";
import { Icon, IconChevronForward, IconLock, IconGlobe } from "@/components/icons";
import { cn } from "@/lib/utils";

export type GroupVisibility = "private" | "public";

interface GroupTypeSelectorProps {
  value: GroupVisibility;
  onChange: (value: GroupVisibility) => void;
  className?: string;
}

export function groupVisibilityToIsPublic(value: GroupVisibility): boolean {
  return value === "public";
}

export function isPublicToGroupVisibility(isPublic?: boolean): GroupVisibility {
  return isPublic ? "public" : "private";
}

export function GroupTypeSelector({ value, onChange, className }: GroupTypeSelectorProps) {
  const { t } = useTranslation();

  const OPTIONS: {
    value: GroupVisibility;
    labelKey: string;
    descriptionKey: string;
    icon: typeof IconLock;
  }[] = [
    {
      value: "private",
      labelKey: "createGroup.typePrivate",
      descriptionKey: "createGroup.typePrivateDesc",
      icon: IconLock,
    },
    {
      value: "public",
      labelKey: "createGroup.typePublic",
      descriptionKey: "createGroup.typePublicDesc",
      icon: IconGlobe,
    },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <p className="px-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {t("createGroup.typeLabel")}
      </p>
      <div className="overflow-hidden rounded-xl bg-white dark:bg-[#2a2a2a]">
        {OPTIONS.map((option, index) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
                index > 0 && "border-t border-zinc-100 dark:border-zinc-700",
                selected && "bg-[#00bbff]/5",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  selected
                    ? "bg-[#00bbff]/15 text-[#00bbff]"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300",
                )}
              >
                <Icon icon={option.icon} size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                  {t(option.labelKey)}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t(option.descriptionKey)}
                </p>
              </div>
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  selected
                    ? "border-[#00bbff] bg-[#00bbff]"
                    : "border-zinc-300 bg-transparent dark:border-zinc-600",
                )}
              >
                {selected && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface GroupTypeRowProps {
  value: GroupVisibility;
  onPress: () => void;
}

export function GroupTypeRow({ value, onPress }: GroupTypeRowProps) {
  const { t } = useTranslation();
  const label =
    value === "public" ? t("createGroup.typePublic") : t("createGroup.typePrivate");

  return (
    <button
      type="button"
      onClick={onPress}
      className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3.5 text-left transition hover:bg-zinc-50 dark:bg-[#2a2a2a] dark:hover:bg-zinc-800/60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300">
        <Icon icon={value === "public" ? IconGlobe : IconLock} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">
          {t("createGroup.typeLabel")}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      </div>
      <Icon icon={IconChevronForward} size={20} className="shrink-0 text-zinc-400" />
    </button>
  );
}
