import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconChevronForward, IconPencil, IconSearch } from "@/components/icons";
import { ContactAvatar } from "@/features/chat/components/create-channel/ContactAvatar";
import { ChatListSkeleton } from "@/features/chat/components/sidebar/ChatListSkeleton";
import { useGetContactsQuery } from "@/features/users/api/usersApi";
import { useContactRealtime } from "@/features/users/realtime/contact-realtime";
import { filterContactsForCurrentUser } from "@/features/chat/lib/conversation-display";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/chat";
import { PanelShell } from "./PanelShell";

interface AdminUsersPanelProps {
  onBack: () => void;
  onEditUser: (user: Contact) => void;
}

export function AdminUsersPanel({ onBack, onEditUser }: AdminUsersPanelProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  useContactRealtime();

  const { data: users = [], isLoading, isError, error, refetch } = useGetContactsQuery(
    { search },
    { pollingInterval: 8000 },
  );

  const visibleUsers = filterContactsForCurrentUser(users);

  return (
    <PanelShell
      title={t("admin.users")}
      onBack={onBack}
      subtitle={t("admin.usersSubtitle", { count: visibleUsers.length })}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3 pb-4 pt-3">
        <div className="relative shrink-0">
          <Icon
            icon={IconSearch}
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            placeholder={t("admin.usersSearch")}
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

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#2b2b2b]">
            {isLoading ? (
              <ChatListSkeleton count={6} showMeta={false} />
            ) : isError ? (
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <p className="text-sm text-red-500">
                  {error instanceof Error ? error.message : t("common.loadFailed")}
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="rounded-full bg-[#00bbff] px-5 py-2 text-sm font-medium text-white hover:bg-[#00a3e0]"
                >
                  {t("common.retry")}
                </button>
              </div>
            ) : visibleUsers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                <p className="text-sm text-zinc-500">{t("admin.usersEmpty")}</p>
                <p className="text-xs text-zinc-400">{t("admin.usersEmptyHint")}</p>
              </div>
            ) : (
              visibleUsers.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onEditUser(user)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                    "hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
                    index > 0 && "border-t border-zinc-100 dark:border-zinc-700",
                  )}
                >
                  <ContactAvatar contact={user} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                      {user.username ? `@${user.username}` : user.phone}
                      {user.position ? ` · ${user.position}` : ""}
                    </p>
                  </div>
                  <Icon icon={IconPencil} size={18} className="shrink-0 text-zinc-400" />
                  <Icon icon={IconChevronForward} size={16} className="shrink-0 text-zinc-300" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
