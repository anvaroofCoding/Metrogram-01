import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Icon,
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconSearch,
} from "@/components/icons";
import { useDisplayConversation } from "@/features/chat/hooks/useDisplayConversation";
import { formatWeekdayShort } from "@/i18n/app-date-format";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/types/chat";
import { ChatAvatar } from "../sidebar/ChatAvatar";

interface ChatSearchBarProps {
  conversation: Conversation;
  messages: Message[];
  onClose: () => void;
  onJumpToMessage: (messageId: string) => void;
  onOpenCalendar: () => void;
}

const actionBtnClass = cn(
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition",
  "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700",
  "dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
  "disabled:pointer-events-none disabled:opacity-30",
);

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-semibold text-zinc-900 dark:text-white">
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </>
  );
}

export function ChatSearchBar({
  conversation,
  messages,
  onClose,
  onJumpToMessage,
  onOpenCalendar,
}: ChatSearchBarProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const display = useDisplayConversation(conversation);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return messages.filter((m) => m.content.toLowerCase().includes(q));
  }, [messages, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (results.length === 0) return;
    onJumpToMessage(results[activeIndex]?.id ?? "");
  }, [activeIndex, results, onJumpToMessage]);

  const goPrev = () => {
    if (results.length === 0) return;
    setActiveIndex((i) => (i - 1 + results.length) % results.length);
  };

  const goNext = () => {
    if (results.length === 0) return;
    setActiveIndex((i) => (i + 1) % results.length);
  };

  return (
    <header className="flex shrink-0 flex-col gap-2 border-b border-zinc-100 px-2 py-2 dark:border-zinc-800 md:mx-4 md:mt-4 md:border-0 md:px-0 md:py-0">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-2",
          "border border-zinc-200/90 bg-zinc-100 shadow-sm",
          "dark:border-zinc-700 dark:bg-zinc-800",
          "md:shadow-sm",
        )}
      >
        <Icon icon={IconSearch} size={18} className="shrink-0 text-zinc-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("chat.search.placeholder")}
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
        />
        {query && results.length > 0 && (
          <span className="shrink-0 px-1 text-xs tabular-nums text-zinc-400">
            {activeIndex + 1}/{results.length}
          </span>
        )}
        <button
          type="button"
          onClick={goPrev}
          disabled={results.length === 0}
          className={actionBtnClass}
          aria-label={t("chat.search.prev")}
        >
          <Icon icon={IconChevronUp} size={18} />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={results.length === 0}
          className={actionBtnClass}
          aria-label={t("chat.search.next")}
        >
          <Icon icon={IconChevronDown} size={18} />
        </button>
        <button
          type="button"
          onClick={onOpenCalendar}
          className={actionBtnClass}
          aria-label={t("chat.search.byDate")}
          title={t("chat.search.byDate")}
        >
          <Icon icon={IconCalendar} size={18} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className={actionBtnClass}
          aria-label={t("common.close")}
        >
          <Icon icon={IconClose} size={20} />
        </button>
      </div>

      {query.trim() && (
        <div
          className={cn(
            "max-h-64 overflow-y-auto rounded-2xl shadow-lg",
            "border border-zinc-200/90 bg-white dark:border-zinc-700 dark:bg-[#212121]",
          )}
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-400">
              {t("search.noResults")}
            </p>
          ) : (
            results.map((msg, i) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => {
                  setActiveIndex(i);
                  onJumpToMessage(msg.id);
                }}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition",
                  i === activeIndex
                    ? "bg-[#00bbff]/10"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                )}
              >
                <ChatAvatar conversation={display} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {display.title}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-400">
                      {formatWeekdayShort(new Date(msg.createdAt))}
                    </span>
                  </div>
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                    {highlightMatch(msg.content, query)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </header>
  );
}
