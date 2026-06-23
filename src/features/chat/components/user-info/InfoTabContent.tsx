import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Icon, IconDocument, IconLink, IconMic, IconNotifications, IconQrCode } from "@/components/icons";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { useGetMessagesQuery } from "@/features/chat/api/chatApi";
import {
  filterConversationMessages,
  formatMessageDate,
  formatVoiceDuration,
  type ConversationMediaItem,
} from "@/features/chat/lib/conversation-message-filters";
import { getInviteJoinPath } from "@/lib/invite-links";
import { cn } from "@/lib/utils";
import type { GroupMember } from "./demo-data";

export const USER_TABS = ["media", "files", "links", "voice"] as const;
export const GROUP_TABS = ["members", "media", "files", "links"] as const;
export const CHANNEL_TABS = ["members", "media", "files", "links", "voice"] as const;

type UserTab = (typeof USER_TABS)[number];
type GroupTab = (typeof GROUP_TABS)[number];
type ChannelTab = (typeof CHANNEL_TABS)[number];

interface InfoTabsProps {
  tabs: readonly string[];
  active: string;
  onChange: (tab: string) => void;
}

export function InfoTabs({ tabs, active, onChange }: InfoTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="z-10 flex shrink-0 gap-1 overflow-x-auto border-b border-zinc-200/80 bg-[#f4f4f5] px-3 py-2 scrollbar-none dark:border-zinc-800 dark:bg-[#1c1c1e]">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            active === tab
              ? "bg-[#d3edfd] text-[#168acd] dark:bg-[#00bbff]/15 dark:text-[#00bbff]"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
          )}
        >
          {t(`info.tabs.${tab}`)}
        </button>
      ))}
    </div>
  );
}

interface UsernameRowProps {
  username: string;
}

export function UsernameRow({ username }: UsernameRowProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3.5 dark:border-zinc-700">
      <span className="text-lg text-zinc-400">@</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-white">
          {username}
        </p>
        <p className="text-xs text-zinc-400">{t("info.username")}</p>
      </div>
      <Icon icon={IconQrCode} size={22} className="shrink-0 text-zinc-400" />
    </div>
  );
}

interface NotificationsRowProps {
  enabled: boolean;
  onToggle: () => void;
}

export function NotificationsRow({ enabled, onToggle }: NotificationsRowProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon icon={IconNotifications} size={22} className="shrink-0 text-zinc-400" />
      <span className="flex-1 text-[15px] text-zinc-900 dark:text-white">
        {t("info.notifications")}
      </span>
      <ToggleSwitch
        enabled={enabled}
        onToggle={onToggle}
        aria-label={t("info.notifications")}
      />
    </div>
  );
}

function MemberRow({
  member,
  onClick,
}: {
  member: GroupMember;
  onClick?: (memberId: string) => void;
}) {
  const { t } = useTranslation();

  const content = (
    <>
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: member.avatarColor ?? "#00bbff" }}
      >
        {member.avatarEmoji ?? member.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-zinc-900 dark:text-white">
          {member.name}
        </p>
        <p className="truncate text-xs text-zinc-500">{member.status}</p>
      </div>
      {member.isOwner && (
        <span className="shrink-0 text-xs text-zinc-400">{t("info.memberOwner")}</span>
      )}
    </>
  );

  if (!onClick) {
    return <div className="flex items-center gap-3 px-4 py-2.5">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onClick(member.id)}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
    >
      {content}
    </button>
  );
}

function EmptyTabState({ label }: { label: string }) {
  return <p className="px-4 py-8 text-center text-sm text-zinc-400">{label}</p>;
}

function LoadingTabState() {
  const { t } = useTranslation();
  return <p className="px-4 py-8 text-center text-sm text-zinc-400">{t("common.loading")}</p>;
}

function MediaGrid({ items }: { items: ConversationMediaItem[] }) {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const lightboxItems = items.map((m) => ({
    id: m.id,
    url: m.url,
    name: m.name,
    kind: m.kind,
  }));

  if (items.length === 0) {
    return <EmptyTabState label={t("info.mediaEmpty")} />;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-2xl">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setStartIndex(index);
              setLightboxOpen(true);
            }}
            className="relative aspect-square overflow-hidden bg-zinc-200 dark:bg-zinc-700"
          >
            {item.kind === "video" ? (
              <video
                src={item.url}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={item.url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )}
            {item.kind === "video" && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
                <span className="rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white">
                  {t("info.videoBadge")}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>
      <ImageLightbox
        images={lightboxItems}
        initialIndex={startIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

interface TabContentProps {
  activeTab: string;
  members: GroupMember[];
  conversationId?: string;
  onMemberClick?: (memberId: string) => void;
}

export function TabContent({
  activeTab,
  members,
  conversationId,
  onMemberClick,
}: TabContentProps) {
  const { t } = useTranslation();
  const needsMessages = activeTab !== "members";
  const { data, isLoading } = useGetMessagesQuery(
    { conversationId: conversationId! },
    { skip: !conversationId || !needsMessages },
  );

  const filtered = useMemo(
    () => filterConversationMessages(data?.items ?? []),
    [data?.items],
  );

  if (activeTab === "members") {
    return (
      <div className="py-1">
        {members.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-zinc-400">{t("info.membersEmpty")}</p>
        ) : (
          members.map((m) => (
            <MemberRow key={m.id} member={m} onClick={onMemberClick} />
          ))
        )}
      </div>
    );
  }

  if (!conversationId) {
    return <EmptyTabState label={t("info.noConversation")} />;
  }

  if (isLoading) {
    return <LoadingTabState />;
  }

  if (activeTab === "media") {
    return <MediaGrid items={filtered.media} />;
  }

  if (activeTab === "links") {
    if (filtered.links.length === 0) {
      return <EmptyTabState label={t("info.linksEmpty")} />;
    }

    return (
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
        {filtered.links.map((link) => {
          const joinPath = getInviteJoinPath(link.url);
          const rowClassName =
            "flex items-center gap-3 px-4 py-3 text-[#00bbff] hover:bg-zinc-50 dark:hover:bg-zinc-800/50";

          return (
            <li key={link.id}>
              {joinPath ? (
                <Link to={joinPath} className={rowClassName}>
                  <Icon icon={IconLink} size={20} className="shrink-0 text-zinc-400" />
                  <span className="min-w-0 flex-1 truncate text-sm">{link.title}</span>
                </Link>
              ) : (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={rowClassName}
                >
                  <Icon icon={IconLink} size={20} className="shrink-0 text-zinc-400" />
                  <span className="min-w-0 flex-1 truncate text-sm">{link.title}</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  if (activeTab === "voice") {
    if (filtered.voice.length === 0) {
      return <EmptyTabState label={t("info.voiceEmpty")} />;
    }

    return (
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
        {filtered.voice.map((v) => (
          <li key={v.id} className="flex items-center gap-3 px-4 py-3">
            <Icon icon={IconMic} size={20} className="text-[#00bbff]" />
            <span className="flex-1 text-sm text-zinc-900 dark:text-white">
              {t("message.attachment.voice")}
            </span>
            <span className="text-xs text-zinc-400">
              {formatVoiceDuration(v.duration)} · {formatMessageDate(v.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (activeTab === "files") {
    if (filtered.files.length === 0) {
      return <EmptyTabState label={t("info.filesEmpty")} />;
    }

    return (
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
        {filtered.files.map((f) => (
          <li key={f.id}>
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <Icon icon={IconDocument} size={20} className="text-zinc-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                  {f.name}
                </p>
                <p className="text-xs uppercase text-zinc-400">{f.kind}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

export type { UserTab, GroupTab, ChannelTab };
