import type { AdminScreen } from "./admin-services";
import { getAdminScreenTitle } from "./admin-services";
import { PanelShell } from "./PanelShell";

interface AdminPlaceholderPanelProps {
  screen: AdminScreen;
  onBack: () => void;
}

export function AdminPlaceholderPanel({ screen, onBack }: AdminPlaceholderPanelProps) {
  return (
    <PanelShell title={getAdminScreenTitle(screen)} onBack={onBack}>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00bbff]/15 text-3xl">
          🚧
        </div>
        <p className="text-[15px] font-medium text-zinc-900 dark:text-white">Tez kunda</p>
        <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
          {getAdminScreenTitle(screen)} xizmati hozircha ishlab chiqilmoqda. Keyingi yangilanishda
          qo&apos;shiladi.
        </p>
      </div>
    </PanelShell>
  );
}
