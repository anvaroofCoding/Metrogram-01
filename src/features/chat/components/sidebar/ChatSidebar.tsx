import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/auth-store";
import { isAdminUser } from "@/features/auth/auth-session";
import type { Contact, Conversation } from "@/types/chat";
import {
  useGetConversationsQuery,
  useOpenPersonalChatMutation,
} from "@/features/chat/api/chatApi";
import type { GlobalSearchTab } from "@/features/chat/lib/global-search";
import { openOrFindPersonalChat } from "@/features/chat/lib/personal-conversation";
import { useGetContactsQuery } from "@/features/users/api/usersApi";
import { isSelfContact, isSelfConversation } from "@/features/chat/lib/conversation-display";
import { EditProfilePanel } from "@/features/profile/components/EditProfilePanel";
import { ProfileSettingsPanel } from "@/features/profile/components/ProfileSettingsPanel";
import { CreateChannelWizard } from "@/features/chat/components/create-channel/CreateChannelWizard";
import { CreateGroupWizard } from "@/features/chat/components/create-group/CreateGroupWizard";
import { AdminPanel } from "@/features/users/components/admin/AdminPanel";
import { ContactsPanel } from "@/features/users/components/ContactsPanel";
import { CategoryTabs } from "./CategoryTabs";
import { ChatList } from "./ChatList";
import { ChatListSkeleton } from "./ChatListSkeleton";
import { GlobalSearchPanel } from "./GlobalSearchPanel";
import { MyChannelsPanel } from "./MyChannelsPanel";
import { NotificationBanner } from "./NotificationBanner";
import { SideMenuDrawer } from "./SideMenuDrawer";
import { SidebarContainer } from "./SidebarContainer";
import { SidebarFAB } from "./SidebarFAB";
import { SidebarHeader } from "./SidebarHeader";

type SidebarView = "chats" | "contacts" | "my-channels" | "admin" | "settings" | "edit-profile";

interface ChatSidebarProps {
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  onChannelCreated?: (conversation: Conversation) => void;
  onGroupCreated?: (conversation: Conversation) => void;
  onConversationRemoved?: (conversationId: string) => void;
}

export function ChatSidebar({
  selectedId,
  onSelect,
  onChannelCreated,
  onGroupCreated,
  onConversationRemoved,
}: ChatSidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = isAdminUser(user);
  const { data: conversations = [], isLoading, isError, error, refetch } = useGetConversationsQuery();
  const { data: contacts = [] } = useGetContactsQuery({});
  const { mutateAsync: openPersonalChat } = useOpenPersonalChatMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [searchTab, setSearchTab] = useState<GlobalSearchTab>("all");
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [view, setView] = useState<SidebarView>("chats");

  const { data: searchContacts = [], isLoading: contactsSearchLoading } = useGetContactsQuery(
    { search: sidebarSearch.trim() || undefined },
    { skip: !searchOpen },
  );

  useEffect(() => {
    if (view === "admin" && !isAdmin) {
      setView("chats");
    }
  }, [view, isAdmin]);

  const handleContactSelect = useCallback(
    async (contact: Contact) => {
      if (isSelfContact(contact)) return;

      const conversation = await openOrFindPersonalChat({
        userId: contact.id,
        conversations,
        contacts,
        openPersonalChat,
      });

      onSelect(conversation);
      setView("chats");
      setCreateChannelOpen(false);
      setCreateGroupOpen(false);
    },
    [conversations, contacts, onSelect, openPersonalChat],
  );

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSidebarSearch("");
    setSearchTab("all");
  }, []);

  const showChats = view === "chats" && !createChannelOpen && !createGroupOpen;

  return (
    <>
      <SidebarContainer>
        {showChats && searchOpen && (
          <GlobalSearchPanel
            query={sidebarSearch}
            onQueryChange={setSidebarSearch}
            onClose={closeSearch}
            activeTab={searchTab}
            onTabChange={setSearchTab}
            conversations={conversations}
            contacts={searchContacts}
            selectedId={selectedId}
            isLoading={isLoading || contactsSearchLoading}
            onConversationSelect={(conversation) => {
              if (isSelfConversation(conversation, undefined, contacts)) return;
              onSelect(conversation);
              closeSearch();
            }}
            onContactSelect={(contact) => {
              void handleContactSelect(contact).then(() => closeSearch());
            }}
          />
        )}

        {showChats && !searchOpen && (
          <>
            <SidebarHeader
              onMenuClick={() => setMenuOpen(true)}
              onSearchFocus={() => setSearchOpen(true)}
            />
            <NotificationBanner />
            <CategoryTabs activeId={activeCategory} onChange={setActiveCategory} />
            {isLoading ? (
              <ChatListSkeleton />
            ) : isError ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                <p className="text-sm text-red-500">
                  {error instanceof Error ? error.message : t("sidebar.loadFailed")}
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="rounded-full bg-[#00bbff] px-5 py-2 text-sm font-medium text-white hover:bg-[#00a3e0]"
                >
                  {t("common.retry")}
                </button>
              </div>
            ) : (
              <ChatList
                conversations={conversations}
                contacts={contacts}
                selectedId={selectedId}
                onSelect={onSelect}
                onConversationRemoved={onConversationRemoved}
                activeCategory={activeCategory}
              />
            )}
            <SidebarFAB
              onNewChannel={() => setCreateChannelOpen(true)}
              onNewGroup={() => setCreateGroupOpen(true)}
            />
          </>
        )}

        {createGroupOpen && (
          <CreateGroupWizard
            onClose={() => setCreateGroupOpen(false)}
            onCreated={(conversation) => {
              setCreateGroupOpen(false);
              onSelect(conversation);
              onGroupCreated?.(conversation);
            }}
          />
        )}

        {createChannelOpen && (
          <CreateChannelWizard
            onClose={() => setCreateChannelOpen(false)}
            onCreated={(conversation) => {
              setCreateChannelOpen(false);
              onSelect(conversation);
              onChannelCreated?.(conversation);
            }}
          />
        )}

        {view === "my-channels" && (
          <MyChannelsPanel
            conversations={conversations}
            selectedId={selectedId}
            isLoading={isLoading}
            onBack={() => setView("chats")}
            onSelect={(conversation) => {
              onSelect(conversation);
              setView("chats");
            }}
            onCreateChannel={() => {
              setView("chats");
              setCreateChannelOpen(true);
            }}
          />
        )}

        {view === "contacts" && (
          <ContactsPanel
            onBack={() => setView("chats")}
            onContactSelect={handleContactSelect}
          />
        )}

        {view === "admin" && isAdmin && (
          <AdminPanel
            onBack={() => setView("chats")}
            onContactSelect={handleContactSelect}
          />
        )}

        {view === "settings" && (
          <ProfileSettingsPanel
            onBack={() => setView("chats")}
            onEdit={() => setView("edit-profile")}
          />
        )}

        {view === "edit-profile" && (
          <EditProfilePanel onBack={() => setView("settings")} />
        )}
      </SidebarContainer>

      <SideMenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSettingsClick={() => {
          setMenuOpen(false);
          setCreateChannelOpen(false);
          setView("settings");
        }}
        onProfileClick={() => {
          setMenuOpen(false);
          setCreateChannelOpen(false);
          setView("settings");
        }}
        onContactsClick={() => {
          setMenuOpen(false);
          setCreateChannelOpen(false);
          setView("contacts");
        }}
        onMyChannelsClick={() => {
          setMenuOpen(false);
          setCreateChannelOpen(false);
          setView("my-channels");
        }}
        onAdminClick={
          isAdmin
            ? () => {
                setMenuOpen(false);
                setCreateChannelOpen(false);
                setView("admin");
              }
            : undefined
        }
      />
    </>
  );
}
