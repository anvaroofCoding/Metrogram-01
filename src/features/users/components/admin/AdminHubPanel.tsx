import { useTranslation } from "react-i18next";
import { Icon, IconChevronForward } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  ADMIN_SERVICE_SECTIONS,
  type AdminScreen,
} from "./admin-services";
import { PanelShell } from "./PanelShell";

interface AdminHubPanelProps {
  onBack: () => void;
  onNavigate: (screen: AdminScreen) => void;
}

export function AdminHubPanel({ onBack, onNavigate }: AdminHubPanelProps) {
  const { t } = useTranslation();

  return (
    <PanelShell title={t("admin.title")} onBack={onBack} subtitle={t("admin.subtitle")}>
      <div className="flex-1 overflow-y-auto px-3 py-3 pb-6">
        <p className="mb-4 px-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t("admin.description")}
        </p>

        <div className="space-y-3">
          {ADMIN_SERVICE_SECTIONS.map((section) => (
            <section key={section.titleKey}>
              <h2 className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {t(section.titleKey)}
              </h2>
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#2b2b2b]">
                {section.items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      "hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
                      index > 0 && "border-t border-zinc-100 dark:border-zinc-700",
                    )}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: item.iconColor }}
                    >
                      <Icon icon={item.icon} size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium text-zinc-900 dark:text-white">
                        {t(item.labelKey)}
                      </span>
                      {item.descriptionKey && (
                        <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {t(item.descriptionKey)}
                        </span>
                      )}
                    </span>
                    <Icon icon={IconChevronForward} size={18} className="shrink-0 text-zinc-400" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}
