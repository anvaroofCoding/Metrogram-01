import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconPersonAdd } from "@/components/icons";
import { AddMembersPanel } from "@/features/chat/components/members/AddMembersPanel";
import { InfoTabs, TabContent } from "@/features/chat/components/user-info/InfoTabContent";
import { InfoCard } from "@/features/chat/components/user-info/ProfileHero";
import { buildConversationMembers, getChannelMemberStats, getConversationMemberCount } from "@/features/chat/lib/conversation-members";
import { translate } from "@/i18n/translate";
import { useGetContactsQuery } from "@/features/users/api/usersApi";
import type { Contact, Conversation } from "@/types/chat";

interface ConversationMembersSectionProps {
  conversation: Conversation;
  tabs: readonly string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onMemberClick?: (memberId: string) => void;
  onConversationUpdated?: (conversation: Conversation) => void;
}

export function ConversationMembersSection({
  conversation,
  tabs,
  activeTab,
  onTabChange,
  onMemberClick,
  onConversationUpdated,
}: ConversationMembersSectionProps) {
  const { t } = useTranslation();
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const { data: contacts = [] } = useGetContactsQuery({}, { pollingInterval: 8000 });

  const members = useMemo(
    () => buildConversationMembers(conversation, contacts),
    [conversation, contacts],
  );

  if (addMembersOpen) {
    return (
      <AddMembersPanel
        conversation={conversation}
        contacts={contacts}
        onBack={() => setAddMembersOpen(false)}
        onAdded={onConversationUpdated}
      />
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <InfoTabs tabs={tabs} active={activeTab} onChange={onTabChange} />

      <InfoCard className="mx-3 mb-2 mt-2 min-h-0 flex-1 overflow-y-auto">
        <TabContent
          activeTab={activeTab}
          members={members}
          conversationId={conversation.id}
          onMemberClick={onMemberClick}
        />
      </InfoCard>

      {activeTab === "members" && (
        <button
          type="button"
          onClick={() => setAddMembersOpen(true)}
          className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#00bbff] text-white shadow-lg hover:bg-[#00a3e0]"
          aria-label={t("info.membersAdd")}
        >
          <Icon icon={IconPersonAdd} size={26} />
        </button>
      )}
    </div>
  );
}

export function getMembersSubtitle(
  conversation: Conversation,
  contacts: Contact[] = [],
): string {
  if (conversation.category === "channel") {
    return getChannelMemberStats(conversation, contacts);
  }
  const count = getConversationMemberCount(conversation, contacts);
  return translate("info.membersCount", { count });
}
