import { useState } from "react";
import { cn } from "@/lib/utils";

interface PinMessageDialogProps {
  open: boolean;
  contactName?: string;
  onClose: () => void;
  onConfirm: (pinForAll: boolean) => void;
}

export function PinMessageDialog({
  open,
  contactName,
  onClose,
  onConfirm,
}: PinMessageDialogProps) {
  const [pinForAll, setPinForAll] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 p-4">
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#2c2c2e]"
        role="dialog"
        aria-modal
        aria-labelledby="pin-dialog-title"
      >
        <h2 id="pin-dialog-title" className="text-xl font-semibold text-zinc-900 dark:text-white">
          Pin message
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Do you want to pin this message at the top of the chat?
        </p>

        {contactName && (
          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={pinForAll}
              onChange={(e) => setPinForAll(e.target.checked)}
              className="h-5 w-5 rounded border-zinc-300 text-[#00bbff] focus:ring-[#00bbff]"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-200">
              Also pin for {contactName.toUpperCase()}
            </span>
          </label>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold uppercase tracking-wide text-[#00bbff]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(pinForAll)}
            className={cn(
              "text-sm font-semibold uppercase tracking-wide text-[#00bbff]",
            )}
          >
            Pin
          </button>
        </div>
      </div>
    </div>
  );
}
