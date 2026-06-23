import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  if (!open) return null;

  const resolvedConfirm = confirmLabel ?? t("common.yes");
  const resolvedCancel = cancelLabel ?? t("common.cancel");

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 p-4">
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#2c2c2e]"
        role="dialog"
        aria-modal
        aria-labelledby="confirm-dialog-title"
      >
        <h2
          id="confirm-dialog-title"
          className="text-xl font-semibold text-zinc-900 dark:text-white"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold uppercase tracking-wide text-[#00bbff]"
          >
            {resolvedCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "text-sm font-semibold uppercase tracking-wide",
              danger ? "text-red-500" : "text-[#00bbff]",
            )}
          >
            {resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
