import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconChevronBack, IconSearch } from "@/components/icons";
import { ChatListItem } from "@/features/chat/components/sidebar/ChatListItem";
import { ChatListSkeleton } from "@/features/chat/components/sidebar/ChatListSkeleton";
import { filterOwnedChannels } from "@/features/chat/lib/owned-channels";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

interface MyChannelsPanelProps {
  conversations: Conversation[];
  selectedId?: string;
  isLoading?: boolean;
  onBack: () => void;
  onSelect: (conversation: Conversation) => void;
  onCreateChannel?: () => void;
}

export function MyChannelsPanel({
  conversations,
  selectedId,
  isLoading,
  onBack,
  onSelect,
  onCreateChannel,
}: MyChannelsPanelProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const ownedChannels = useMemo(() => {
    const owned = filterOwnedChannels(conversations);
    const q = search.trim().toLowerCase();
    if (!q) return owned;

    return owned.filter(
      (channel) =>
        channel.title.toLowerCase().includes(q) ||
        (channel.username?.toLowerCase().includes(q) ?? false) ||
        (channel.description?.toLowerCase().includes(q) ?? false),
    );
  }, [conversations, search]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden rounded-[28px] bg-white dark:bg-[#1e1e1e]">
      <header className="flex shrink-0 items-center px-2 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label={t("common.back")}
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-zinc-900 dark:text-white">
          {t("menu.myChannels")}
        </h1>
        <div className="w-10" />
      </header>

      <div className="shrink-0 px-3 pb-2">
        <div className="relative">
          <Icon
            icon={IconSearch}
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full rounded-full py-2.5 pl-9 pr-4 text-sm outline-none",
              "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400",
              "dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500",
              "focus:ring-2 focus:ring-[#00bbff]/30",
            )}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatListSkeleton count={6} />
        ) : ownedChannels.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {search.trim() ? t("search.noResults") : t("sidebar.empty.channel")}
            </p>
            {!search.trim() && onCreateChannel && (
              <button
                type="button"
                onClick={onCreateChannel}
                className="rounded-full bg-[#00bbff] px-5 py-2 text-sm font-medium text-white hover:bg-[#00a3e0]"
              >
                {t("createChannel.create")}
              </button>
            )}
          </div>
        ) : (
          ownedChannels.map((channel) => (
            <ChatListItem
              key={channel.id}
              conversation={channel}
              selected={selectedId === channel.id}
              onClick={() => onSelect(channel)}
            />
          ))
        )}
      </div>
    </div>
  );
}
