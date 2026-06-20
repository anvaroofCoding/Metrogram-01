import { useEffect, useState } from "react";
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
  const [notifications, setNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState("Media");
  const [editOpen, setEditOpen] = useState(false);

  const isGroup = conversation ? isGroupChat(conversation) : false;
  const tabs = isGroup ? GROUP_TABS : USER_TABS;
  const { statusLabel: peerStatusLabel } = usePeerPresence(conversation);

  useEffect(() => {
    if (open) {
      setActiveTab(isGroup ? "Members" : "Media");
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
        "relative flex h-full w-[360px] shrink-0 flex-col overflow-hidden rounded-[28px]",
        "bg-[#f4f4f5] shadow-xl dark:bg-[#1c1c1e]",
      )}
    >
      <InfoPanelHeader
        title={isGroup ? "Group Info" : "User Info"}
        onClose={onClose}
        showEdit={isGroup}
        onEdit={() => setEditOpen(true)}
      />

      <div className="flex min-h-0 shrink-0 flex-col">
        <ProfileHero conversation={conversation} subtitle={subtitle} />

        <InfoCard className="mb-2">
          {!isGroup && <UsernameRow username={username} />}
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
