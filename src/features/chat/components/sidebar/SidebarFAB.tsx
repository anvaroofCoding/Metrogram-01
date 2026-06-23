import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Icon,
  IconClose,
  IconMegaphone,
  IconPencil,
  IconPeople,
} from "@/components/icons";
import { cn } from "@/lib/utils";

interface FabMenuItem {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface SidebarFABProps {
  className?: string;
  onNewChannel?: () => void;
  onNewGroup?: () => void;
}

function FabMenuItemButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-zinc-900 dark:text-white">
        {icon}
      </span>
      <span className="text-[15px] font-normal text-zinc-900 dark:text-white">{label}</span>
    </button>
  );
}

export function SidebarFAB({
  className,
  onNewChannel,
  onNewGroup,
}: SidebarFABProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const menuItems: FabMenuItem[] = [
    {
      id: "channel",
      labelKey: "fab.newChannel",
      icon: <Icon icon={IconMegaphone} size={22} />,
      onClick: () => {
        onNewChannel?.();
        setOpen(false);
      },
    },
    {
      id: "group",
      labelKey: "fab.newGroup",
      icon: <Icon icon={IconPeople} size={22} />,
      onClick: () => {
        onNewGroup?.();
        setOpen(false);
      },
    },
  ];

  return (
    <>
      {open && (
        <div
          className="absolute inset-0 z-10"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className={cn("absolute right-5 z-20 flex flex-col items-end gap-3 bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))]", className)}>
        {open && (
          <div
            className={cn(
              "mb-1 min-w-[200px] overflow-hidden rounded-2xl bg-white py-1.5 shadow-xl",
              "dark:bg-[#2b2b2b] dark:shadow-black/50",
              "animate-in fade-in slide-in-from-bottom-2 duration-200",
            )}
            role="menu"
          >
            {menuItems.map((item) => (
              <FabMenuItemButton
                key={item.id}
                icon={item.icon}
                label={t(item.labelKey)}
                onClick={item.onClick}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105",
            "bg-[#00bbff] text-white hover:bg-[#00a3e0]",
            open && "rotate-0",
          )}
          aria-label={open ? t("common.close") : t("fab.open")}
          aria-expanded={open}
        >
          <Icon
            icon={open ? IconClose : IconPencil}
            size={open ? 28 : 26}
            className="transition-transform duration-200"
          />
        </button>
      </div>
    </>
  );
}
