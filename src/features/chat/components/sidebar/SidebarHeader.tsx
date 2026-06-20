import { Icon, IconClose, IconMenu, IconSearch } from "@/components/icons";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  onMenuClick: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  onSearchFocus?: () => void;
  className?: string;
}

export function SidebarHeader({
  onMenuClick,
  search = "",
  onSearchChange,
  onSearchFocus,
  className,
}: SidebarHeaderProps) {
  const isSearchTrigger = Boolean(onSearchFocus);

  return (
    <header className={cn("flex items-center gap-2 px-3 pt-3 pb-2", className)}>
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        aria-label="Menyu"
      >
        <Icon icon={IconMenu} size={22} />
      </button>

      <div className="relative flex-1">
        <Icon
          icon={IconSearch}
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="search"
          placeholder="Qidirish"
          value={isSearchTrigger ? "" : search}
          readOnly={isSearchTrigger}
          onFocus={onSearchFocus}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className={cn(
            "w-full rounded-full py-2.5 pl-9 pr-9 text-sm outline-none",
            "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400",
            "dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500",
            "focus:ring-2 focus:ring-[#00bbff]/30",
            isSearchTrigger && "cursor-pointer",
          )}
        />
        {!isSearchTrigger && search && (
          <button
            type="button"
            onClick={() => onSearchChange?.("")}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            aria-label="Tozalash"
          >
            <Icon icon={IconClose} size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
