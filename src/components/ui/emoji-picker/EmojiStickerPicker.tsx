import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconEmoji, IconSearch } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  EMOJI_CATEGORIES,
  EMOJI_QUICK,
  STICKER_EMOJIS,
} from "./emoji-data";
import { AppleEmoji } from "./AppleEmoji";

type PickerTab = "emoji" | "sticker";

interface EmojiStickerPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  onDelete?: () => void;
  className?: string;
}
export function EmojiStickerPicker({
  open,
  onClose,
  onSelect,
  onDelete,
  className,
}: EmojiStickerPickerProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<PickerTab>("emoji");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[1]?.id ?? "smileys");

  const filteredEmojis = useMemo(() => {
    if (!query.trim()) return null;
    return EMOJI_CATEGORIES.flatMap((c) => c.emojis)
      .filter((emoji, i, arr) => arr.indexOf(emoji) === i)
      .slice(0, 64);
  }, [query]);

  const activeEmojis =
    filteredEmojis ??
    EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.emojis ??
    EMOJI_CATEGORIES[1].emojis;

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40"
        aria-label={t("common.close")}
        onClick={onClose}
      />

      <div
        className={cn(
          "relative z-50 flex max-h-[min(280px,42vh)] flex-col overflow-hidden rounded-2xl shadow-lg",
          "border border-zinc-200/80 bg-[#f2f2f7]",
          "dark:border-zinc-700 dark:bg-[#1c1c1e]",
          className,
        )}
      >
        {tab === "emoji" && (
          <div className="flex shrink-0 gap-0.5 overflow-x-auto px-2 pt-1.5 scrollbar-none">
            {EMOJI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setQuery("");
                }}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition",
                  activeCategory === cat.id && !query
                    ? "bg-white shadow-sm dark:bg-zinc-800"
                    : "opacity-70 hover:opacity-100",
                )}
                aria-label={cat.label}
              >
                <AppleEmoji emoji={cat.icon} size={18} />
              </button>
            ))}
          </div>
        )}

        {tab === "emoji" && (
          <div className="flex shrink-0 gap-0.5 overflow-x-auto px-2 py-1 scrollbar-none">
            {EMOJI_QUICK.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSelect(emoji)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-white/80 dark:hover:bg-zinc-800"
              >
                <AppleEmoji emoji={emoji} size={18} />
              </button>
            ))}
          </div>
        )}

        <div className="shrink-0 px-2 pb-1">
          <div className="relative">
            <Icon
              icon={IconSearch}
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("composer.emojiSearch")}
              className={cn(
                "w-full rounded-lg py-1.5 pl-8 pr-2.5 text-sm outline-none",
                "bg-white text-zinc-900 placeholder:text-zinc-400",
                "dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500",
              )}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1">
          {tab === "emoji" ? (
            <>
              {!query && (
                <p className="sticky top-0 z-10 bg-[#f2f2f7] py-0.5 text-center text-[10px] font-medium text-zinc-400 dark:bg-[#1c1c1e]">
                  {EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.label}
                </p>
              )}
              <div className="flex flex-wrap content-start">
                {activeEmojis.map((emoji, i) => (
                  <button
                    key={`${emoji}-${i}`}
                    type="button"
                    onClick={() => onSelect(emoji)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition hover:bg-white/80 dark:hover:bg-zinc-800"
                  >
                    <AppleEmoji emoji={emoji} size={24} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap content-start gap-0.5 py-0.5">
              {STICKER_EMOJIS.map((emoji, i) => (
                <button
                  key={`${emoji}-st-${i}`}
                  type="button"
                  onClick={() => onSelect(emoji)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white transition hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  <AppleEmoji emoji={emoji} size={32} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-zinc-200/80 px-2 py-1 dark:border-zinc-700">
          <div className="flex gap-0.5">
            <button
              type="button"
              onClick={() => setTab("emoji")}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition",
                tab === "emoji"
                  ? "bg-[#00bbff]/15 text-[#00bbff]"
                  : "text-zinc-500 dark:text-zinc-400",
              )}
              aria-label={t("composer.emojiTab")}
            >
              <Icon icon={IconEmoji} size={18} />
            </button>
            <button
              type="button"
              onClick={() => setTab("sticker")}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition",
                tab === "sticker"
                  ? "bg-[#00bbff]/15 text-[#00bbff]"
                  : "text-zinc-500 dark:text-zinc-400",
              )}
              aria-label={t("composer.stickersTab")}
            >
              <AppleEmoji emoji="🎨" size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition hover:bg-white dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label={t("composer.delete")}
          >
            ⌫
          </button>
        </div>
      </div>
    </>
  );
}
