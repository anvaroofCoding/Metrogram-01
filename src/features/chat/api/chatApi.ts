import { apiFetch } from "@/lib/api-client";
import { createChatApi, createEndpointHooks } from "@/lib/chat-query";
import { getCurrentUserId } from "@/features/auth/auth-session";
import { sortConversationsForSidebar } from "@/features/chat/lib/sort-conversations";
import type {
  Conversation,
  CreateChannelInput,
  CreateGroupInput,
  Message,
  PaginatedMessages,
  PinMessageInput,
  RecordMessageViewsInput,
  SendMessageInput,
  ToggleReactionInput,
  UpdateConversationInput,
  UpdateMessageInput,
} from "@/types/chat";

function patchMessagesCache(
  conversationId: string,
  updater: (items: Message[]) => Message[],
  optimisticUpdate: <T>(endpoint: string, arg: unknown, data: T) => (() => void) | undefined,
  getCacheData: <T>(endpoint: string, arg: unknown) => T | undefined,
) {
  const current = getCacheData<PaginatedMessages>("getMessages", { conversationId });
  if (!current) return undefined;
  return optimisticUpdate<PaginatedMessages>(
    "getMessages",
    { conversationId },
    { ...current, items: updater(current.items) },
  );
}
export function getCurrentUserIdForChat(): string {
  return getCurrentUserId();
}

const chatApiInstance = createChatApi({
  baseUrl: "/api",
  tagTypes: ["Conversation", "Message", "Typing"],
});

export const chatApi = chatApiInstance.injectEndpoints((build) => ({
  getConversations: build.query<void, Conversation[]>("getConversations", {
    queryFn: async () => {
      const items = await apiFetch<Conversation[]>("/api/conversations");
      return sortConversationsForSidebar(items);
    },
    providesTags: () => ["Conversation"],
  }),

  getMessages: build.query<{ conversationId: string; cursor?: string }, PaginatedMessages>(
    "getMessages",
    {
      queryFn: async ({ conversationId, cursor }) => {
        const params = new URLSearchParams({ conversationId });
        if (cursor) params.set("cursor", cursor);
        return apiFetch<PaginatedMessages>(`/api/messages?${params}`);
      },
      providesTags: (_result, _error, arg) => [
        "Message",
        `Message:${arg.conversationId}`,
      ],
      keepUnusedDataFor: 120,
    },
  ),

  sendMessage: build.mutation<SendMessageInput, Message>("sendMessage", {
    mutationFn: async (input) =>
      apiFetch<Message>("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    invalidatesTags: (_result, _error, arg) => [
      "Conversation",
      `Message:${arg.conversationId}`,
    ],
    onQueryStarted: async (arg, { queryFulfilled, optimisticUpdate, getCacheData, dispatch }) => {
      const clientId = arg.clientId ?? `client-${Date.now()}`;
      const senderId = getCurrentUserIdForChat();
      const optimistic: Message = {
        id: clientId,
        conversationId: arg.conversationId,
        senderId,
        content: arg.content,
        attachments: arg.attachments,
        createdAt: new Date().toISOString(),
        status: "sending",
        clientId,
      };

      const current = getCacheData<PaginatedMessages>("getMessages", {
        conversationId: arg.conversationId,
      });

      const conversations = getCacheData<Conversation[]>("getConversations", undefined);
      const rollbackConversations =
        conversations &&
        optimisticUpdate<Conversation[]>(
          "getConversations",
          undefined,
          sortConversationsForSidebar(
            conversations.map((c) =>
              c.id === arg.conversationId
                ? {
                    ...c,
                    unreadCount: 0,
                    isRead: true,
                    lastMessage: {
                      id: clientId,
                      conversationId: arg.conversationId,
                      senderId,
                      content: arg.content,
                      attachments: arg.attachments,
                      createdAt: optimistic.createdAt,
                      status: "sending",
                      clientId,
                    },
                    updatedAt: optimistic.createdAt,
                  }
                : c,
            ),
          ),
        );

      const rollback = optimisticUpdate<PaginatedMessages>(
        "getMessages",
        { conversationId: arg.conversationId },
        {
          items: [...(current?.items ?? []), optimistic],
          hasMore: current?.hasMore ?? false,
        },
      );

      try {
        const { data: message } = await queryFulfilled;
        dispatch({
          type: "cache/update",
          endpointName: "getMessages",
          arg: { conversationId: arg.conversationId },
          updater: (draft: unknown) => {
            const page = draft as PaginatedMessages;
            return {
              ...page,
              items: page.items.map((m) =>
                m.clientId === clientId ? { ...(message as Message), status: "sent" as const } : m,
              ),
            };
          },
        });
      } catch {
        rollback();
        rollbackConversations?.();
      }
    },
  }),

  updateMessage: build.mutation<UpdateMessageInput, Message>("updateMessage", {
    mutationFn: async ({ messageId, content }) =>
      apiFetch<Message>(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }),
    onQueryStarted: async (arg, { queryFulfilled, optimisticUpdate, getCacheData }) => {
      const rollback = patchMessagesCache(
        arg.conversationId,
        (items) =>
          items.map((m) =>
            m.id === arg.messageId
              ? { ...m, content: arg.content, editedAt: new Date().toISOString() }
              : m,
          ),
        optimisticUpdate,
        getCacheData,
      );
      try {
        const { data } = await queryFulfilled;
        const message = data as Message;
        patchMessagesCache(
          arg.conversationId,
          (items) => items.map((m) => (m.id === message.id ? message : m)),
          optimisticUpdate,
          getCacheData,
        );
      } catch {
        rollback?.();
      }
    },
    invalidatesTags: () => ["Conversation"],
  }),

  deleteMessage: build.mutation<{ messageId: string; conversationId: string }, { id: string; success: boolean }>(
    "deleteMessage",
    {
      mutationFn: async ({ messageId, conversationId }) => {
        void conversationId;
        return apiFetch<{ id: string; success: boolean }>(`/api/messages/${messageId}`, {
          method: "DELETE",
        });
      },
      onQueryStarted: async (arg, { queryFulfilled, optimisticUpdate, getCacheData }) => {
        const rollback = patchMessagesCache(
          arg.conversationId,
          (items) => items.filter((m) => m.id !== arg.messageId),
          optimisticUpdate,
          getCacheData,
        );
        try {
          await queryFulfilled;
        } catch {
          rollback?.();
        }
      },
      invalidatesTags: () => ["Conversation"],
    },
  ),

  bulkDeleteMessages: build.mutation<
    { conversationId: string; ids: string[] },
    { deleted: string[] }
  >("bulkDeleteMessages", {
    mutationFn: async ({ ids }) =>
      apiFetch<{ deleted: string[] }>("/api/messages/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }),
    onQueryStarted: async (arg, { queryFulfilled, optimisticUpdate, getCacheData }) => {
      const idSet = new Set(arg.ids);
      const rollback = patchMessagesCache(
        arg.conversationId,
        (items) => items.filter((m) => !idSet.has(m.id)),
        optimisticUpdate,
        getCacheData,
      );
      try {
        await queryFulfilled;
      } catch {
        rollback?.();
      }
    },
    invalidatesTags: () => ["Conversation"],
  }),

  pinMessage: build.mutation<PinMessageInput, Conversation>("pinMessage", {
    mutationFn: async ({ conversationId, messageId, pinForAll }) =>
      apiFetch<Conversation>(`/api/conversations/${conversationId}/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, pinForAll }),
      }),
    invalidatesTags: () => ["Conversation"],
  }),

  unpinMessage: build.mutation<{ conversationId: string }, Conversation>("unpinMessage", {
    mutationFn: async ({ conversationId }) =>
      apiFetch<Conversation>(`/api/conversations/${conversationId}/pin`, {
        method: "DELETE",
      }),
    invalidatesTags: () => ["Conversation"],
  }),

  toggleReaction: build.mutation<ToggleReactionInput, Message>("toggleReaction", {
    mutationFn: async ({ messageId, emoji }) =>
      apiFetch<Message>(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      }),
    onQueryStarted: async (_arg, { queryFulfilled, optimisticUpdate, getCacheData }) => {
      try {
        const { data } = await queryFulfilled;
        const message = data as Message;
        patchMessagesCache(
          message.conversationId,
          (items) => items.map((m) => (m.id === message.id ? message : m)),
          optimisticUpdate,
          getCacheData,
        );
      } catch {
        // ignore
      }
    },
  }),

  recordMessageViews: build.mutation<RecordMessageViewsInput, { updated: number }>(
    "recordMessageViews",
    {
      mutationFn: async ({ messageIds }) =>
        apiFetch<{ updated: number }>("/api/messages/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageIds }),
        }),
    },
  ),

  createChannel: build.mutation<CreateChannelInput, Conversation>("createChannel", {
    mutationFn: async (input) =>
      apiFetch<Conversation>("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "channel", ...input }),
      }),
    invalidatesTags: () => ["Conversation"],
  }),

  createGroup: build.mutation<CreateGroupInput, Conversation>("createGroup", {
    mutationFn: async (input) =>
      apiFetch<Conversation>("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "group", ...input }),
      }),
    invalidatesTags: () => ["Conversation"],
  }),

  openPersonalChat: build.mutation<{ userId: string }, Conversation>("openPersonalChat", {
    mutationFn: async ({ userId }) =>
      apiFetch<Conversation>(`/api/users/${userId}/conversation`, {
        method: "POST",
      }),
    invalidatesTags: () => ["Conversation"],
  }),

  addMembers: build.mutation<
    { conversationId: string; memberIds: string[] },
    Conversation
  >("addMembers", {
    mutationFn: async ({ conversationId, memberIds }) =>
      apiFetch<Conversation>(`/api/conversations/${conversationId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds }),
      }),
    invalidatesTags: () => ["Conversation"],
  }),

  updateConversation: build.mutation<UpdateConversationInput, Conversation>(
    "updateConversation",
    {
      mutationFn: async ({ conversationId, ...body }) =>
        apiFetch<Conversation>(`/api/conversations/${conversationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      invalidatesTags: () => ["Conversation"],
    },
  ),

  markConversationRead: build.mutation<{ conversationId: string }, Conversation>(
    "markConversationRead",
    {
      mutationFn: async ({ conversationId }) =>
        apiFetch<Conversation>(`/api/conversations/${conversationId}/read`, {
          method: "POST",
        }),
      onQueryStarted: async ({ conversationId }, { queryFulfilled, getCacheData, optimisticUpdate }) => {
        const current = getCacheData<Conversation[]>("getConversations", undefined);
        if (!current) return;

        const rollback = optimisticUpdate<Conversation[]>(
          "getConversations",
          undefined,
          current.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0, isRead: true } : c,
          ),
        );

        try {
          const { data } = await queryFulfilled;
          const updated = data as Conversation;
          const latest = getCacheData<Conversation[]>("getConversations", undefined) ?? current;
          optimisticUpdate<Conversation[]>(
            "getConversations",
            undefined,
            latest.map((c) => (c.id === updated.id ? updated : c)),
          );
        } catch {
          rollback();
        }
      },
    },
  ),

  leaveConversation: build.mutation<{ conversationId: string }, { success: true }>(
    "leaveConversation",
    {
      mutationFn: async ({ conversationId }) =>
        apiFetch<{ success: true }>(`/api/conversations/${conversationId}/leave`, {
          method: "POST",
        }),
      onQueryStarted: async ({ conversationId }, { optimisticUpdate, getCacheData }) => {
        const current = getCacheData<Conversation[]>("getConversations", undefined);
        if (!current) return;

        optimisticUpdate<Conversation[]>(
          "getConversations",
          undefined,
          current.filter((c) => c.id !== conversationId),
        );
      },
      invalidatesTags: () => ["Conversation"],
    },
  ),

  pinConversationList: build.mutation<{ conversationId: string }, Conversation>(
    "pinConversationList",
    {
      mutationFn: async ({ conversationId }) =>
        apiFetch<Conversation>(`/api/conversations/${conversationId}/pin-list`, {
          method: "POST",
        }),
      onQueryStarted: async ({ conversationId }, { queryFulfilled, optimisticUpdate, getCacheData }) => {
        const current = getCacheData<Conversation[]>("getConversations", undefined);
        if (!current) return;

        const rollback = optimisticUpdate<Conversation[]>(
          "getConversations",
          undefined,
          sortConversationsForSidebar(
            current.map((c) =>
              c.id === conversationId
                ? { ...c, isPinned: true, pinnedListAt: new Date().toISOString() }
                : c,
            ),
          ),
        );

        try {
          const { data } = await queryFulfilled;
          const latest = getCacheData<Conversation[]>("getConversations", undefined) ?? current;
          optimisticUpdate<Conversation[]>(
            "getConversations",
            undefined,
            sortConversationsForSidebar(
              latest.map((c) => (c.id === data.id ? data : c)),
            ),
          );
        } catch {
          rollback?.();
        }
      },
    },
  ),

  unpinConversationList: build.mutation<{ conversationId: string }, Conversation>(
    "unpinConversationList",
    {
      mutationFn: async ({ conversationId }) =>
        apiFetch<Conversation>(`/api/conversations/${conversationId}/pin-list`, {
          method: "DELETE",
        }),
      onQueryStarted: async ({ conversationId }, { queryFulfilled, optimisticUpdate, getCacheData }) => {
        const current = getCacheData<Conversation[]>("getConversations", undefined);
        if (!current) return;

        const rollback = optimisticUpdate<Conversation[]>(
          "getConversations",
          undefined,
          sortConversationsForSidebar(
            current.map((c) =>
              c.id === conversationId
                ? { ...c, isPinned: false, pinnedListAt: undefined }
                : c,
            ),
          ),
        );

        try {
          const { data } = await queryFulfilled;
          const latest = getCacheData<Conversation[]>("getConversations", undefined) ?? current;
          optimisticUpdate<Conversation[]>(
            "getConversations",
            undefined,
            sortConversationsForSidebar(
              latest.map((c) => (c.id === data.id ? data : c)),
            ),
          );
        } catch {
          rollback?.();
        }
      },
    },
  ),

  deleteConversation: build.mutation<{ conversationId: string }, { success: true; id: string }>(
    "deleteConversation",
    {
      mutationFn: async ({ conversationId }) =>
        apiFetch<{ success: true; id: string }>(`/api/conversations/${conversationId}`, {
          method: "DELETE",
        }),
      onQueryStarted: async ({ conversationId }, { optimisticUpdate, getCacheData }) => {
        const current = getCacheData<Conversation[]>("getConversations", undefined);
        if (!current) return;

        optimisticUpdate<Conversation[]>(
          "getConversations",
          undefined,
          current.filter((c) => c.id !== conversationId),
        );
      },
      invalidatesTags: () => ["Conversation"],
    },
  ),
}));

const chatHooks = createEndpointHooks(chatApi, chatApi.endpoints);

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useBulkDeleteMessagesMutation,
  usePinMessageMutation,
  useUnpinMessageMutation,
  useToggleReactionMutation,
  useRecordMessageViewsMutation,
  useCreateChannelMutation,
  useCreateGroupMutation,
  useOpenPersonalChatMutation,
  useAddMembersMutation,
  useMarkConversationReadMutation,
  useUpdateConversationMutation,
  useLeaveConversationMutation,
  usePinConversationListMutation,
  useUnpinConversationListMutation,
  useDeleteConversationMutation,
} = chatHooks as {
  useGetConversationsQuery: () => import("@/lib/chat-query").QueryHookResult<Conversation[]>;
  useGetMessagesQuery: (
    arg: { conversationId: string; cursor?: string },
    options?: { skip?: boolean },
  ) => import("@/lib/chat-query").QueryHookResult<PaginatedMessages>;
  useSendMessageMutation: () => import("@/lib/chat-query").MutationHookResult<
    SendMessageInput,
    Message
  >;
  useUpdateMessageMutation: () => import("@/lib/chat-query").MutationHookResult<
    UpdateMessageInput,
    Message
  >;
  useDeleteMessageMutation: () => import("@/lib/chat-query").MutationHookResult<
    { messageId: string; conversationId: string },
    { id: string; success: boolean }
  >;
  useBulkDeleteMessagesMutation: () => import("@/lib/chat-query").MutationHookResult<
    { conversationId: string; ids: string[] },
    { deleted: string[] }
  >;
  usePinMessageMutation: () => import("@/lib/chat-query").MutationHookResult<
    PinMessageInput,
    Conversation
  >;
  useUnpinMessageMutation: () => import("@/lib/chat-query").MutationHookResult<
    { conversationId: string },
    Conversation
  >;
  useToggleReactionMutation: () => import("@/lib/chat-query").MutationHookResult<
    ToggleReactionInput,
    Message
  >;
  useRecordMessageViewsMutation: () => import("@/lib/chat-query").MutationHookResult<
    RecordMessageViewsInput,
    { updated: number }
  >;
  useCreateChannelMutation: () => import("@/lib/chat-query").MutationHookResult<
    CreateChannelInput,
    Conversation
  >;
  useCreateGroupMutation: () => import("@/lib/chat-query").MutationHookResult<
    CreateGroupInput,
    Conversation
  >;
  useOpenPersonalChatMutation: () => import("@/lib/chat-query").MutationHookResult<
    { userId: string },
    Conversation
  >;
  useAddMembersMutation: () => import("@/lib/chat-query").MutationHookResult<
    { conversationId: string; memberIds: string[] },
    Conversation
  >;
  useMarkConversationReadMutation: () => import("@/lib/chat-query").MutationHookResult<
    { conversationId: string },
    Conversation
  >;
  useUpdateConversationMutation: () => import("@/lib/chat-query").MutationHookResult<
    UpdateConversationInput,
    Conversation
  >;
  useLeaveConversationMutation: () => import("@/lib/chat-query").MutationHookResult<
    { conversationId: string },
    { success: true }
  >;
  usePinConversationListMutation: () => import("@/lib/chat-query").MutationHookResult<
    { conversationId: string },
    Conversation
  >;
  useUnpinConversationListMutation: () => import("@/lib/chat-query").MutationHookResult<
    { conversationId: string },
    Conversation
  >;
  useDeleteConversationMutation: () => import("@/lib/chat-query").MutationHookResult<
    { conversationId: string },
    { success: true; id: string }
  >;
};
