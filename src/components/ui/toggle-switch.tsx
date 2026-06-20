import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
  "aria-label"?: string;
}

export function ToggleSwitch({
  enabled,
  onToggle,
  className,
  "aria-label": ariaLabel = "Toggle",
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-7 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-200",
        enabled ? "bg-[#00bbff]" : "bg-zinc-300 dark:bg-zinc-600",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-sm",
          "transition-transform duration-200 ease-in-out",
          enabled ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}
