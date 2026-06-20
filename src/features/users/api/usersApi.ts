import { apiFetch } from "@/lib/api-client";
import { createChatApi, createEndpointHooks } from "@/lib/chat-query";
import type { Contact } from "@/types/chat";
import {
  toContact,
  type RegisterUserInput,
  type RegisteredUser,
  type UpdateUserInput,
} from "@/features/users/lib/user-mappers";

const usersApiInstance = createChatApi({
  baseUrl: "/api",
  tagTypes: ["Contact"],
});

export const usersApi = usersApiInstance.injectEndpoints((build) => ({
  getContacts: build.query<{ search?: string }, Contact[]>("getContacts", {
    queryFn: async (arg) => {
      const search = arg?.search;
      const params = new URLSearchParams();
      if (search?.trim()) params.set("search", search.trim());
      const qs = params.toString();
      const users = await apiFetch<RegisteredUser[]>(
        `/api/users${qs ? `?${qs}` : ""}`,
      );
      return users.map(toContact);
    },
    providesTags: () => ["Contact"],
  }),

  registerUser: build.mutation<RegisterUserInput, Contact>("registerUser", {
    mutationFn: async (input) => {
      const user = await apiFetch<RegisteredUser>("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return toContact(user);
    },
    invalidatesTags: () => ["Contact"],
  }),

  updateUser: build.mutation<
    { id: string; data: UpdateUserInput },
    Contact
  >("updateUser", {
    mutationFn: async ({ id, data }) => {
      const user = await apiFetch<RegisteredUser>(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return toContact(user);
    },
    invalidatesTags: () => ["Contact"],
  }),
}));

export const { useGetContactsQuery, useRegisterUserMutation, useUpdateUserMutation } =
  createEndpointHooks(usersApi, usersApi.endpoints) as {
  useGetContactsQuery: (
    arg?: { search?: string },
    options?: { skip?: boolean; pollingInterval?: number },
  ) => import("@/lib/chat-query").QueryHookResult<Contact[]>;
  useRegisterUserMutation: () => import("@/lib/chat-query").MutationHookResult<
    RegisterUserInput,
    Contact
  >;
  useUpdateUserMutation: () => import("@/lib/chat-query").MutationHookResult<
    { id: string; data: UpdateUserInput },
    Contact
  >;
};
