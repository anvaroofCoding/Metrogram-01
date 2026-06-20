import { useCallback, useEffect, useMemo, useRef, useState } from "react";



import { Icon, IconChat } from "@/components/icons";



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

import { getDisplayConversation } from "@/features/chat/lib/conversation-display";

import { toDateKey } from "@/features/chat/lib/message-dates";

import { openOrFindPersonalChat, buildUserIdAliasSet } from "@/features/chat/lib/personal-conversation";
import { canPostToConversation } from "@/features/chat/lib/conversation-members";
import { useGetContactsQuery } from "@/features/users/api/usersApi";

import type { Conversation } from "@/types/chat";





export function ChatPage() {



  const [selected, setSelected] = useState<Conversation | null>(null);



  const [userInfoOpen, setUserInfoOpen] = useState(false);



  const [channelInfoOpen, setChannelInfoOpen] = useState(false);



  const [searchOpen, setSearchOpen] = useState(false);



  const [calendarOpen, setCalendarOpen] = useState(false);



  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);



  const [scrollToDateKey, setScrollToDateKey] = useState<string | null>(null);

  const [calendarInitialDate, setCalendarInitialDate] = useState<string | undefined>();

  const [selectionUi, setSelectionUi] = useState({ active: false, count: 0 });
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
    if (!selected) return;
    const updated = conversations.find((c) => c.id === selected.id);
    if (
      updated &&
      (updated.unreadCount !== selected.unreadCount ||
        updated.isRead !== selected.isRead)
    ) {
      setSelected(updated);
    }
  }, [conversations, selected]);



  const isChannel = selected?.category === "channel";







  const handleSelect = (conversation: Conversation | null) => {



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

  const handleLeaveConversation = useCallback(async () => {
    if (!selected) return;

    const label =
      selected.category === "channel" ? "kanaldan" : "guruhdan";

    if (
      !window.confirm(
        `Haqiqatan ham ${label} chiqmoqchimisiz? Yozishmalaringiz qoladi, lekin endi a'zo bo'lmaysiz.`,
      )
    ) {
      return;
    }

    await leaveConversation({ conversationId: selected.id });
    handleSelect(null);
  }, [leaveConversation, selected, handleSelect]);

  const handleConversationRemoved = useCallback(
    (conversationId: string) => {
      if (selected?.id === conversationId) {
        handleSelect(null);
      }
    },
    [handleSelect, selected?.id],
  );





  return (



    <div className="flex h-dvh gap-3 overflow-hidden bg-zinc-100 p-3 dark:bg-zinc-950">



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







      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-white shadow-xl dark:bg-[#1e1e1e] dark:shadow-black/40">



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

              canCompose={canPostToConversation(selected)}
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



            <p className="text-sm">Suhbatni tanlang yoki yangisini boshlang</p>



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



    </div>



  );



}





