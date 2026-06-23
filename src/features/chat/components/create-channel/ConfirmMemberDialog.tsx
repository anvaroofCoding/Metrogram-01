import { useTranslation } from "react-i18next";
import { ContactAvatar } from "./ContactAvatar";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/chat";

interface ConfirmMemberDialogProps {
  open: boolean;
  contact: Contact | null;
  channelName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmMemberDialog({
  open,
  contact,
  channelName,
  onCancel,
  onConfirm,
}: ConfirmMemberDialogProps) {
  const { t } = useTranslation();

  if (!open || !contact) return null;

  return (
    <>
      <div className="absolute inset-0 z-40 bg-black/25" onClick={onCancel} aria-hidden />

      <div
        role="dialog"
        aria-modal
        className={cn(
          "absolute left-1/2 top-1/2 z-50 w-[min(320px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2",
          "overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#2b2b2b]",
          "animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        <div className="flex items-center gap-3 px-5 pt-5">
          <ContactAvatar contact={contact} size="md" className="h-10 w-10 text-sm" />
          <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-white">
            {t("createChannel.confirmAddTitle")}
          </h3>
        </div>

        <p className="px-5 py-4 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          {t("createChannel.confirmAddDescription", {
            name: contact.name,
            channelName,
          })}
        </p>

        <div className="flex justify-end gap-1 px-3 pb-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#00bbff] hover:bg-[#00bbff]/10"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#00bbff] hover:bg-[#00bbff]/10"
          >
            {t("common.add")}
          </button>
        </div>
      </div>
    </>
  );
}
