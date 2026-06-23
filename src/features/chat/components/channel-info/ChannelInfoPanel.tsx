import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconInfo } from "@/components/icons";
import { InviteLinkRow } from "@/features/chat/components/invite/InviteLinkRow";
import {
  ConversationMembersSection,
  getMembersSubtitle,
} from "@/features/chat/components/members/ConversationMembersSection";
import { useGetContactsQuery } from "@/features/users/api/usersApi";
import { InfoPanelHeader } from "@/features/chat/components/user-info/InfoPanelHeader";
import {
  CHANNEL_TABS,
  NotificationsRow,
} from "@/features/chat/components/user-info/InfoTabContent";
import { InfoCard, ProfileHero } from "@/features/chat/components/user-info/ProfileHero";
import { EditChannelPanel } from "./EditChannelPanel";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

interface ChannelInfoPanelProps {
  open: boolean;
  conversation: Conversation | null;
  onClose: () => void;
  onMemberClick?: (memberId: string) => void;
  onConversationUpdated?: (conversation: Conversation) => void;
}

export function ChannelInfoPanel({
  open,
  conversation,
  onClose,
  onMemberClick,
  onConversationUpdated,
}: ChannelInfoPanelProps) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(CHANNEL_TABS[0]);
  const [editOpen, setEditOpen] = useState(false);
  const { data: contacts = [] } = useGetContactsQuery({}, { pollingInterval: 8000 });

  useEffect(() => {
    if (open) setActiveTab("members");
  }, [open, conversation?.id]);

  useEffect(() => {
    if (!open) setEditOpen(false);
  }, [open]);

  const subtitle = useMemo(
    () => (conversation ? getMembersSubtitle(conversation, contacts) : ""),
    [conversation, contacts],
  );

  if (!open || !conversation) return null;

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden bg-[#f4f4f5] dark:bg-[#1c1c1e]",
        "max-md:fixed max-md:inset-0 max-md:z-[60] max-md:w-full max-md:rounded-none",
        "md:w-[360px] md:shrink-0 md:rounded-[28px] md:shadow-xl",
      )}
    >
      <InfoPanelHeader
        title={t("info.channelTitle")}
        onClose={onClose}
        showEdit
        onEdit={() => setEditOpen(true)}
      />

      <div className="flex min-h-0 shrink-0 flex-col">
        <ProfileHero conversation={conversation} subtitle={subtitle} />

        <InfoCard className="mb-2">
          {conversation.description && (
            <div className="flex items-start gap-3 border-b border-zinc-100 px-4 py-3.5 dark:border-zinc-700">
              <Icon icon={IconInfo} size={22} className="mt-0.5 shrink-0 text-zinc-400" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] text-zinc-900 dark:text-white">
                  {conversation.description}
                </p>
                <p className="text-xs text-zinc-400">{t("info.description")}</p>
              </div>
            </div>
          )}

          {conversation.inviteLink && (
            <InviteLinkRow inviteLink={conversation.inviteLink} label={t("info.channelLink")} />
          )}

          <NotificationsRow
            enabled={notifications}
            onToggle={() => setNotifications((v) => !v)}
          />
        </InfoCard>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <ConversationMembersSection
          conversation={conversation}
          tabs={CHANNEL_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onMemberClick={onMemberClick}
          onConversationUpdated={onConversationUpdated}
        />
      </div>

      {editOpen && (
        <EditChannelPanel
          conversation={conversation}
          onBack={() => setEditOpen(false)}
          onSaved={onConversationUpdated}
        />
      )}
    </aside>
  );
}
