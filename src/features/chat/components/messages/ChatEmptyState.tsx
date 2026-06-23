import { useTranslation } from "react-i18next";

export function ChatEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-8">
      <p className="text-center text-[15px] font-medium text-zinc-500 dark:text-zinc-400">
        {t("chat.empty.title")}
      </p>
      <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
        {t("chat.empty.hint")}
      </p>
    </div>
  );
}
