import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useRef,

  useState,

  type ReactNode,

} from "react";

import { getCurrentUserId } from "@/features/auth/auth-session";

import { useAuth } from "@/features/auth/auth-store";

import { chatApi } from "@/features/chat/api/chatApi";

import { usersApi } from "@/features/users/api/usersApi";

import {

  acquireRealtimeSocket,

  emitSocketEvent,

  onSocketConnectionChange,

  onSocketEvent,

} from "@/realtime/realtime-socket";

import type { Message, TypingIndicator } from "@/types/chat";



const TYPING_TTL_MS = 5000;



interface PresencePayload {

  userId: string;

  status: "online" | "offline";

  lastSeenAt?: string;

}



interface RealtimeContextValue {

  isConnected: boolean;

  sendTyping: (conversationId: string, isTyping: boolean) => void;

  isUserOnline: (userId: string) => boolean;

  isPeerTyping: (conversationId: string, userId: string) => boolean;

  getLastSeenAt: (userId: string) => string | undefined;

}



const RealtimeContext = createContext<RealtimeContextValue | null>(null);



export function RealtimeProvider({ children }: { children: ReactNode }) {

  const { user } = useAuth();

  const [isConnected, setIsConnected] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(() => new Set());

  const [typingPeers, setTypingPeers] = useState<Map<string, number>>(() => new Map());

  const [lastSeenAtByUser, setLastSeenAtByUser] = useState<Record<string, string>>({});

  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());



  const clearTypingKey = useCallback((key: string) => {

    setTypingPeers((prev) => {

      if (!prev.has(key)) return prev;

      const next = new Map(prev);

      next.delete(key);

      return next;

    });

    const timer = typingTimersRef.current.get(key);

    if (timer) {

      clearTimeout(timer);

      typingTimersRef.current.delete(key);

    }

  }, []);



  const markTyping = useCallback(

    (conversationId: string, userId: string, isTyping: boolean) => {

      const key = `${conversationId}:${userId}`;

      if (!isTyping) {

        clearTypingKey(key);

        return;

      }



      setTypingPeers((prev) => new Map(prev).set(key, Date.now()));



      const existing = typingTimersRef.current.get(key);

      if (existing) clearTimeout(existing);



      const timer = setTimeout(() => {

        clearTypingKey(key);

      }, TYPING_TTL_MS);

      typingTimersRef.current.set(key, timer);

    },

    [clearTypingKey],

  );



  useEffect(() => {

    if (!user) return;

    setOnlineUsers(new Set());

    setTypingPeers(new Map());

    setLastSeenAtByUser({});

    const release = acquireRealtimeSocket();

    const unsubConnection = onSocketConnectionChange(setIsConnected);



    const unsubMessageNew = onSocketEvent("message:new", (payload) => {
      const message = payload as Message;
      chatApi.emitRealtimeEvent({ type: "message:new", payload: message });
      handleNewMessage(message);
    });

    const unsubMessageUpdated = onSocketEvent("message:updated", (payload) => {
      const message = payload as Message;
      chatApi.emitRealtimeEvent({ type: "message:updated", payload: message });
      handleUpdatedMessage(message);
    });

    const unsubMessageDeleted = onSocketEvent("message:deleted", (payload) => {
      const data = payload as { id: string; conversationId: string };
      chatApi.emitRealtimeEvent({ type: "message:deleted", payload: data });
      handleDeletedMessage(data);
    });



    const unsubConversation = onSocketEvent("conversation:updated", () => {

      chatApi.util.invalidateTags(["Conversation"]);

    });



    const unsubContactCreated = onSocketEvent("contact:created", () => {

      usersApi.util.invalidateTags(["Contact"]);

    });



    const unsubContactUpdated = onSocketEvent("contact:updated", () => {

      usersApi.util.invalidateTags(["Contact"]);

    });



    const unsubTyping = onSocketEvent("typing", (payload) => {

      const { conversationId, userId, isTyping } = payload as TypingIndicator;

      if (!conversationId || !userId) return;

      markTyping(conversationId, userId, isTyping);

    });



    const unsubPresence = onSocketEvent("presence", (payload) => {

      const { userId, status, lastSeenAt } = payload as PresencePayload;

      if (!userId) return;



      setOnlineUsers((prev) => {

        const next = new Set(prev);

        if (status === "online") next.add(userId);

        else next.delete(userId);

        return next;

      });



      if (status === "offline" && lastSeenAt) {

        setLastSeenAtByUser((prev) => ({ ...prev, [userId]: lastSeenAt }));

      }

    });



    return () => {

      unsubMessageNew();
      unsubMessageUpdated();
      unsubMessageDeleted();

      unsubConversation();

      unsubContactCreated();

      unsubContactUpdated();

      unsubTyping();

      unsubPresence();

      unsubConnection();

      release();

      for (const timer of typingTimersRef.current.values()) {

        clearTimeout(timer);

      }

      typingTimersRef.current.clear();

    };

  }, [markTyping, user?.id]);



  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {

    emitSocketEvent("typing", {

      conversationId,

      userId: getCurrentUserId(),

      isTyping,

    });

  }, []);



  const isUserOnline = useCallback(

    (userId: string) => onlineUsers.has(userId),

    [onlineUsers],

  );



  const isPeerTyping = useCallback(

    (conversationId: string, userId: string) => {

      const key = `${conversationId}:${userId}`;

      const ts = typingPeers.get(key);

      if (!ts) return false;

      return Date.now() - ts < TYPING_TTL_MS;

    },

    [typingPeers],

  );



  const getLastSeenAt = useCallback(

    (userId: string) => lastSeenAtByUser[userId],

    [lastSeenAtByUser],

  );



  const value = useMemo(

    () => ({

      isConnected,

      sendTyping,

      isUserOnline,

      isPeerTyping,

      getLastSeenAt,

    }),

    [isConnected, sendTyping, isUserOnline, isPeerTyping, getLastSeenAt],

  );



  return (

    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>

  );

}



function handleNewMessage(message: Message) {
  chatApi.util.updateQueryData<{ items: Message[]; hasMore: boolean }>(
    "getMessages",
    { conversationId: message.conversationId },
    (draft) => ({
      ...draft,
      items: [...(draft?.items ?? []), message],
    }),
  );
  chatApi.util.invalidateTags(["Conversation"]);
}

function handleUpdatedMessage(message: Message) {
  chatApi.util.updateQueryData<{ items: Message[]; hasMore: boolean }>(
    "getMessages",
    { conversationId: message.conversationId },
    (draft) => ({
      ...draft,
      items: (draft?.items ?? []).map((m) => (m.id === message.id ? message : m)),
    }),
  );
  chatApi.util.invalidateTags(["Conversation"]);
}

function handleDeletedMessage(data: { id: string; conversationId: string }) {
  chatApi.util.updateQueryData<{ items: Message[]; hasMore: boolean }>(
    "getMessages",
    { conversationId: data.conversationId },
    (draft) => ({
      ...draft,
      items: (draft?.items ?? []).filter((m) => m.id !== data.id),
    }),
  );
  chatApi.util.invalidateTags(["Conversation"]);
}



export function useRealtime() {

  const ctx = useContext(RealtimeContext);

  if (!ctx) throw new Error("useRealtime must be used within RealtimeProvider");

  return ctx;

}


