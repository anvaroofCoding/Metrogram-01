import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconInfo } from "@/components/icons";
import { InviteLinkRow } from "@/features/chat/components/invite/InviteLinkRow";
import { ConversationMembersSection, getMembersSubtitle } from "@/features/chat/components/members/ConversationMembersSection";
import { EditChannelPanel } from "@/features/chat/components/channel-info/EditChannelPanel";
import { usePeerPresence } from "@/features/chat/hooks/usePeerPresence";
import { InfoPanelHeader } from "./InfoPanelHeader";
import {
  GROUP_TABS,
  InfoTabs,
  NotificationsRow,
  TabContent,
  USER_TABS,
  UsernameRow,
} from "./InfoTabContent";
import { InfoCard, ProfileHero } from "./ProfileHero";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

interface UserInfoPanelProps {
  open: boolean;
  conversation: Conversation | null;
  onClose: () => void;
  onMemberClick?: (memberId: string) => void;
  onConversationUpdated?: (conversation: Conversation) => void;
}

function isGroupChat(conversation: Conversation): boolean {
  return (
    conversation.category === "group" ||
    (conversation.participantIds.length > 2 &&
      conversation.category !== "channel" &&
      conversation.category !== "personal")
  );
}

export function UserInfoPanel({
  open,
  conversation,
  onClose,
  onMemberClick,
  onConversationUpdated,
}: UserInfoPanelProps) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState("media");
  const [editOpen, setEditOpen] = useState(false);

  const isGroup = conversation ? isGroupChat(conversation) : false;
  const tabs = isGroup ? GROUP_TABS : USER_TABS;
  const { statusLabel: peerStatusLabel } = usePeerPresence(conversation);

  useEffect(() => {
    if (open) {
      setActiveTab(isGroup ? "members" : "media");
    }
  }, [open, conversation?.id, isGroup]);

  useEffect(() => {
    if (!open) setEditOpen(false);
  }, [open]);

  if (!open || !conversation) return null;

  const subtitle = isGroup
    ? getMembersSubtitle(conversation)
    : peerStatusLabel;

  const username =
    conversation.username ?? conversation.title.toLowerCase().replace(/\s+/g, "");

  const handleConversationUpdated = (updated: Conversation) => {
    onConversationUpdated?.(updated);
  };

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden bg-[#f4f4f5] dark:bg-[#1c1c1e]",
        "max-md:fixed max-md:inset-0 max-md:z-[60] max-md:w-full max-md:rounded-none",
        "md:w-[360px] md:shrink-0 md:rounded-[28px] md:shadow-xl",
      )}
    >
      <InfoPanelHeader
        title={isGroup ? t("info.groupTitle") : t("info.userTitle")}
        onClose={onClose}
        showEdit={isGroup}
        onEdit={() => setEditOpen(true)}
      />

      <div className="flex min-h-0 shrink-0 flex-col">
        <ProfileHero conversation={conversation} subtitle={subtitle} />

        <InfoCard className="mb-2">
          {!isGroup && <UsernameRow username={username} />}

          {isGroup && conversation.description && (
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

          {isGroup && conversation.isPublic && conversation.inviteLink && (
            <InviteLinkRow
              inviteLink={conversation.inviteLink}
              label={t("info.groupInvite")}
            />
          )}

          <NotificationsRow
            enabled={notifications}
            onToggle={() => setNotifications((v) => !v)}
          />
        </InfoCard>
      </div>

      {isGroup ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <ConversationMembersSection
            conversation={conversation}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onMemberClick={onMemberClick}
            onConversationUpdated={handleConversationUpdated}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <InfoTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-1">
            <TabContent
              activeTab={activeTab}
              members={[]}
              conversationId={conversation.id}
            />
          </div>
        </div>
      )}

      {editOpen && isGroup && (
        <EditChannelPanel
          conversation={conversation}
          onBack={() => setEditOpen(false)}
          onSaved={handleConversationUpdated}
        />
      )}
    </aside>
  );
}
