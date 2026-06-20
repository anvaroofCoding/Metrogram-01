import { useState } from "react";
import { Icon, IconClose, IconNotifications } from "@/components/icons";
import { cn } from "@/lib/utils";

export function NotificationBanner({ className }: { className?: string }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "mx-3 mb-2 flex items-center gap-2 rounded-xl px-3 py-2.5",
        "bg-zinc-100 dark:bg-zinc-800/80",
        className,
      )}
    >
      <Icon icon={IconNotifications} size={18} className="shrink-0 text-zinc-500" />
      <p className="flex-1 text-xs leading-snug text-zinc-600 dark:text-zinc-400">
        Never miss a message! 🔔 Enable notifications to stay updated.
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        aria-label="Yopish"
      >
        <Icon icon={IconClose} size={16} />
      </button>
    </div>
  );
}
