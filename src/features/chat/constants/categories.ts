export type ChatCategoryId = "all" | "personal" | "group" | "channel" | "bot";

export const CHAT_CATEGORIES = [
  { id: "all" },
  { id: "personal" },
  { id: "group" },
  { id: "channel" },
  { id: "bot" },
] as const satisfies ReadonlyArray<{ id: ChatCategoryId }>;
