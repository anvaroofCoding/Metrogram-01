interface ChatEmptyStateProps {
  contactName?: string;
  onGreet: () => void;
  disabled?: boolean;
  canCompose?: boolean;
}

export function ChatEmptyState({
  contactName,
  onGreet,
  disabled,
  canCompose = true,
}: ChatEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
      <div className="max-w-[300px] rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-800/80">
        <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">
          Hali xabarlar yo&apos;q...
        </p>
        {canCompose ? (
          <>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Xabar yuboring yoki salomlashish uchun pastdagi belgini bosing.
            </p>
            {contactName && (
              <p className="mt-2 text-xs text-zinc-400">
                {contactName} bilan suhbatni boshlang
              </p>
            )}
            <button
              type="button"
              onClick={onGreet}
              disabled={disabled}
              className="mt-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100 text-5xl transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              aria-label="Salom yuborish"
            >
              👋
            </button>
          </>
        ) : (
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Bu kanalda faqat administrator xabar yuborishi mumkin.
          </p>
        )}
      </div>
    </div>
  );
}
