import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

interface DeleteCountdownBannerProps {
  open: boolean;
  title: string;
  secondsLeft: number;
  onCancel: () => void;
}

export function DeleteCountdownBanner({
  open,
  title,
  secondsLeft,
  onCancel,
}: DeleteCountdownBannerProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return createPortal(
    <div className="fixed bottom-6 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-zinc-900/95 px-5 py-3 text-white shadow-2xl backdrop-blur-sm dark:bg-[#1c1c1e]/95">
      <p className="text-sm">
        {title} — <span className="font-semibold tabular-nums">{secondsLeft}</span>{" "}
        {t("common.seconds")}
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl bg-white/15 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/25"
      >
        {t("common.cancel")}
      </button>
    </div>,
    document.body,
  );
}
