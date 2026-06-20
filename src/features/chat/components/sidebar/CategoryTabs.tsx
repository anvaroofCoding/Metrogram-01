import { useCallback, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  Icon,
  IconChat,
  IconInbox,
  IconMegaphone,
  IconPeople,
  IconPerson,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  CHAT_CATEGORIES,
  type ChatCategoryId,
} from "@/features/chat/constants/categories";

const CATEGORY_ICONS: Record<ChatCategoryId, IconType> = {
  all: IconInbox,
  personal: IconPerson,
  group: IconPeople,
  channel: IconMegaphone,
  bot: IconChat,
};

const SCROLL_STEP = 88;

interface CategoryTabsProps {
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function CategoryTabs({ activeId, onChange, className }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    updateScrollEdges();

    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollEdges, { passive: true });
    const observer = new ResizeObserver(updateScrollEdges);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollEdges);
      observer.disconnect();
    };
  }, [updateScrollEdges]);

  useEffect(() => {
    const el = scrollRef.current;
    const activeTab = el?.querySelector<HTMLElement>(`[data-tab-id="${activeId}"]`);
    activeTab?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeId]);

  const scrollByStep = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "right" ? SCROLL_STEP : -SCROLL_STEP,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative", className)}>
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Chapga scroll"
          onClick={() => scrollByStep("left")}
          className={cn(
            "absolute left-0 top-0 z-10 flex h-[calc(100%-0.5rem)] w-9 items-center justify-start pl-1",
            "bg-gradient-to-r from-white via-white/90 to-transparent",
            "dark:from-[#1e1e1e] dark:via-[#1e1e1e]/90 dark:to-transparent",
            "cursor-pointer transition-opacity hover:opacity-100",
          )}
        />
      )}

      <div
        ref={scrollRef}
        role="tablist"
        aria-label="Chat kategoriyalari"
        className={cn(
          "flex gap-1 overflow-x-auto scroll-smooth px-3 pb-2 scrollbar-none",
          canScrollLeft && "pl-[31px]",
          canScrollRight && "pr-[31px]",
        )}
      >
        {CHAT_CATEGORIES.map((cat) => {
          const isActive = activeId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              data-tab-id={cat.id}
              aria-selected={isActive}
              onClick={() => onChange(cat.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-[#00bbff] text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
              )}
            >
              <Icon icon={CATEGORY_ICONS[cat.id]} size={14} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {canScrollRight && (
        <button
          type="button"
          aria-label="O'ngga scroll"
          onClick={() => scrollByStep("right")}
          className={cn(
            "absolute right-0 top-0 z-10 flex h-[calc(100%-0.5rem)] w-9 items-center justify-end pr-1",
            "bg-gradient-to-l from-white via-white/90 to-transparent",
            "dark:from-[#1e1e1e] dark:via-[#1e1e1e]/90 dark:to-transparent",
            "cursor-pointer transition-opacity hover:opacity-100",
          )}
        />
      )}
    </div>
  );
}
