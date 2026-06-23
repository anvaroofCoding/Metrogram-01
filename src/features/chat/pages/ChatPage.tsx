import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";



import { Icon, IconChat } from "@/components/icons";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";



import { ChannelInfoPanel } from "@/features/chat/components/channel-info/ChannelInfoPanel";

import { ChatHeaderBar } from "@/features/chat/components/chat-header/ChatHeaderBar";

import { ChatSearchBar } from "@/features/chat/components/chat-header/ChatSearchBar";

import { JumpToDateCalendar } from "@/features/chat/components/chat-header/JumpToDateCalendar";

import { ChatSidebar } from "@/features/chat/components/sidebar/ChatSidebar";

import { UserInfoPanel } from "@/features/chat/components/user-info/UserInfoPanel";

import { ChatWindow, type ChatWindowActions } from "@/features/chat/components/ChatWindow";

import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useLeaveConversationMutation,
  useOpenPersonalChatMutation,
} from "@/features/chat/api/chatApi";

import { getCurrentUserId } from "@/features/auth/auth-session";

import { getDisplayConversation, isSelfConversation } from "@/features/chat/lib/conversation-display";

import { toDateKey } from "@/features/chat/lib/message-dates";

import { openOrFindPersonalChat, buildUserIdAliasSet } from "@/features/chat/lib/personal-conversation";
import { canPostToConversation } from "@/features/chat/lib/conversation-members";
import { useGetContactsQuery } from "@/features/users/api/usersApi";

import type { Conversation } from "@/types/chat";





export function ChatPage() {
  const { t } = useTranslation();

  const location = useLocation();

  const [selected, setSelected] = useState<Conversation | null>(null);



  const [userInfoOpen, setUserInfoOpen] = useState(false);



  const [channelInfoOpen, setChannelInfoOpen] = useState(false);



  const [searchOpen, setSearchOpen] = useState(false);



  const [calendarOpen, setCalendarOpen] = useState(false);



  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);



  const [scrollToDateKey, setScrollToDateKey] = useState<string | null>(null);

  const [calendarInitialDate, setCalendarInitialDate] = useState<string | undefined>();

  const [selectionUi, setSelectionUi] = useState({ active: false, count: 0 });
  const [leaveConfirm, setLeaveConfirm] = useState<Conversation | null>(null);
  const chatActionsRef = useRef<ChatWindowActions | null>(null);





  const { data: conversations = [] } = useGetConversationsQuery();

  const { data: contacts = [] } = useGetContactsQuery({});



  const { mutateAsync: openPersonalChat } = useOpenPersonalChatMutation();

  const { mutateAsync: leaveConversation } = useLeaveConversationMutation();



  const { data: messagesData } = useGetMessagesQuery(

    { conversationId: selected?.id ?? "" },

    { skip: !selected },

  );



  const messages = messagesData?.items ?? [];



  const messageDates = useMemo(
    () => [...new Set(messages.map((m) => toDateKey(m.createdAt)))],
    [messages],
  );

  useEffect(() => {
    const openConversationId = (location.state as { openConversationId?: string } | null)
      ?.openConversationId;
    if (!openConversationId) return;

    const conversation = conversations.find((item) => item.id === openConversationId);
    if (conversation) {
      setSelected(conversation);
      setUserInfoOpen(false);
      setChannelInfoOpen(false);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, conversations]);

  useEffect(() => {
    if (!selected) return;
    const updated = conversations.find((c) => c.id === selected.id);
    if (!updated) return;

    const pinChanged =
      updated.isPinned !== selected.isPinned ||
      updated.pinnedListAt !== selected.pinnedListAt ||
      updated.pinnedMessage?.id !== selected.pinnedMessage?.id ||
      updated.pinnedMessage?.content !== selected.pinnedMessage?.content;
    const readChanged =
      updated.unreadCount !== selected.unreadCount || updated.isRead !== selected.isRead;

    if (pinChanged || readChanged) {
      setSelected(updated);
    }
  }, [conversations, selected]);

  useEffect(() => {
    if (selected && isSelfConversation(selected, undefined, contacts)) {
      setSelected(null);
    }
  }, [selected, contacts]);

  const isChannel = selected?.category === "channel";







  const handleSelect = (conversation: Conversation | null) => {
    if (conversation && isSelfConversation(conversation, undefined, contacts)) {
      return;
    }

    setSelected(conversation);



    setUserInfoOpen(false);



    setChannelInfoOpen(false);



    setSearchOpen(false);



    setHighlightedMessageId(null);



    setScrollToDateKey(null);
    setSelectionUi({ active: false, count: 0 });



  };







  const handleInfoClick = () => {



    if (isChannel) {



      setUserInfoOpen(false);



      setChannelInfoOpen(true);



    } else {



      setChannelInfoOpen(false);



      setUserInfoOpen(true);



    }



  };







  const handleConversationUpdated = useCallback((conversation: Conversation) => {



    setSelected((prev) => (prev?.id === conversation.id ? conversation : prev));



  }, []);







  const handleMemberClick = useCallback(



    async (memberId: string) => {



      const currentUserId = getCurrentUserId();



      const targetAliases = buildUserIdAliasSet(memberId, contacts);
      const requesterAliases = buildUserIdAliasSet(currentUserId, contacts);
      if ([...targetAliases].some((id) => requesterAliases.has(id))) return;



      const conversation = await openOrFindPersonalChat({
        userId: memberId,
        conversations,
        contacts,
        openPersonalChat,
      });







      setSelected(conversation);



      setUserInfoOpen(false);



      setChannelInfoOpen(false);



    },



    [conversations, contacts, openPersonalChat],



  );







  const handleJumpToMessage = useCallback((messageId: string) => {



    setHighlightedMessageId(messageId);



  }, []);







  const handleJumpToDate = useCallback((dateKey: string) => {



    setScrollToDateKey(dateKey);



  }, []);







  const handleScrollComplete = useCallback(() => {



    setScrollToDateKey(null);



  }, []);

  const handleStartSelection = useCallback(() => {
    setSearchOpen(false);
    chatActionsRef.current?.startSelection();
  }, []);

  const handleCancelSelection = useCallback(() => {
    chatActionsRef.current?.cancelSelection();
  }, []);

  const handleLeaveConversation = useCallback(() => {
    if (!selected) return;
    setLeaveConfirm(selected);
  }, [selected]);

  const handleLeaveConfirm = useCallback(async () => {
    if (!leaveConfirm) return;
    await leaveConversation({ conversationId: leaveConfirm.id });
    handleSelect(null);
    setLeaveConfirm(null);
  }, [leaveConfirm, leaveConversation, handleSelect]);

  const handleConversationRemoved = useCallback(
    (conversationId: string) => {
      if (selected?.id === conversationId) {
        handleSelect(null);
      }
    },
    [handleSelect, selected?.id],
  );





  return (



    <div className="flex h-dvh overflow-hidden bg-white md:gap-3 md:bg-zinc-100 md:p-3 dark:bg-[#1e1e1e] md:dark:bg-zinc-950">



      <div
        className={
          selected
            ? "hidden min-h-0 md:flex md:flex-none"
            : "flex min-h-0 flex-1 md:flex-none"
        }
      >
        <ChatSidebar



        selectedId={selected?.id}



        onSelect={handleSelect}



        onChannelCreated={(conversation) => {
          setSelected(conversation);
          setUserInfoOpen(false);
          setChannelInfoOpen(true);
        }}

        onGroupCreated={(conversation) => {
          setSelected(conversation);
          setChannelInfoOpen(false);
          setUserInfoOpen(true);
        }}

        onConversationRemoved={handleConversationRemoved}

      />
      </div>







      <main
        className={
          selected
            ? "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#1e1e1e] md:rounded-[28px] md:shadow-xl dark:md:shadow-black/40"
            : "relative hidden min-h-0 min-w-0 flex-col overflow-hidden bg-white dark:bg-[#1e1e1e] md:flex md:flex-1 md:rounded-[28px] md:shadow-xl dark:md:shadow-black/40"
        }
      >



        {selected ? (



          <>



            {searchOpen ? (



              <ChatSearchBar



                conversation={selected}



                messages={messages}



                onClose={() => {



                  setSearchOpen(false);



                  setHighlightedMessageId(null);



                }}



                onJumpToMessage={handleJumpToMessage}



                onOpenCalendar={() => {
                  setCalendarInitialDate(undefined);
                  setCalendarOpen(true);
                }}



              />



            ) : (



              <ChatHeaderBar



                conversation={selected}



                onInfoClick={handleInfoClick}



                onSearchClick={() => setSearchOpen(true)}

                onSelectMessages={handleStartSelection}

                onLeave={handleLeaveConversation}

                selectionMode={selectionUi.active}
                selectedCount={selectionUi.count}

                onCancelSelection={handleCancelSelection}



              />



            )}



            <ChatWindow



              conversationId={selected.id}



              contactName={getDisplayConversation(selected).title}



              peerLastReadAt={selected.peerLastReadAt}
              pinnedMessage={selected.pinnedMessage}



              highlightedMessageId={highlightedMessageId}



              scrollToDateKey={scrollToDateKey}



              onScrollComplete={handleScrollComplete}



              onDateSeparatorClick={(dateKey) => {
                setCalendarInitialDate(dateKey);
                setCalendarOpen(true);
              }}

              canCompose={canPostToConversation(selected, contacts)}
              conversationCategory={selected.category}
              actionsRef={chatActionsRef}
              onSelectionChange={setSelectionUi}
            />



            <JumpToDateCalendar
              open={calendarOpen}
              onClose={() => {
                setCalendarOpen(false);
                setCalendarInitialDate(undefined);
              }}
              messageDates={messageDates}
              initialDateKey={calendarInitialDate}
              onJump={handleJumpToDate}
            />



          </>



        ) : (



          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-zinc-500">



            <Icon icon={IconChat} size={48} className="opacity-40" />



            <p className="text-sm">{t("chat.selectOrStart")}</p>



          </div>



        )}



      </main>







      <UserInfoPanel



        open={userInfoOpen}



        conversation={selected}



        onClose={() => setUserInfoOpen(false)}



        onMemberClick={(memberId) => void handleMemberClick(memberId)}



        onConversationUpdated={handleConversationUpdated}



      />







      <ChannelInfoPanel



        open={channelInfoOpen}



        conversation={selected}



        onClose={() => setChannelInfoOpen(false)}



        onMemberClick={(memberId) => void handleMemberClick(memberId)}



        onConversationUpdated={handleConversationUpdated}



      />

      <ConfirmDialog
        open={Boolean(leaveConfirm)}
        title={
          leaveConfirm?.category === "channel"
            ? t("sidebar.leave.channelTitle")
            : t("sidebar.leave.groupTitle")
        }
        description={
          leaveConfirm?.category === "channel"
            ? t("sidebar.leave.channelDescription")
            : t("sidebar.leave.groupDescription")
        }
        confirmLabel={t("sidebar.leave.confirm")}
        cancelLabel={t("common.cancel")}
        danger
        onCancel={() => setLeaveConfirm(null)}
        onConfirm={() => void handleLeaveConfirm()}
      />



    </div>



  );



}





