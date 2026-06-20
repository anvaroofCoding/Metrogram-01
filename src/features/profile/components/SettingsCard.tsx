import { cn } from "@/lib/utils";

interface SettingsCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsCard({ children, className }: SettingsCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#2b2b2b]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SettingsInfoRowProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  showDivider?: boolean;
}

export function SettingsInfoRow({
  icon,
  value,
  label,
  showDivider = true,
}: SettingsInfoRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3.5",
        showDivider && "border-b border-zinc-100 last:border-b-0 dark:border-zinc-700",
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-zinc-400">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] text-zinc-900 dark:text-white">{value}</p>
        <p className="text-xs text-zinc-400">{label}</p>
      </div>
    </div>
  );
}

interface SettingsMenuRowProps {
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  showDivider?: boolean;
}

export function SettingsMenuRow({
  icon,
  label,
  trailing,
  onClick,
  disabled = false,
  showDivider = true,
}: SettingsMenuRowProps) {
  const interactive = Boolean(onClick) && !disabled;
  const Tag = interactive ? "button" : "div";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      disabled={interactive ? false : undefined}
      aria-disabled={disabled || undefined}
      onClick={interactive ? onClick : undefined}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        interactive && "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
        disabled && "cursor-not-allowed opacity-45",
        showDivider && "border-b border-zinc-100 last:border-b-0 dark:border-zinc-700",
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-zinc-400">
        {icon}
      </span>
      <span
        className={cn(
          "flex-1 text-[15px]",
          disabled ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-900 dark:text-white",
        )}
      >
        {label}
      </span>
      {trailing && (
        <span className={cn("shrink-0 text-sm", disabled ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400")}>
          {trailing}
        </span>
      )}
    </Tag>
  );
}
