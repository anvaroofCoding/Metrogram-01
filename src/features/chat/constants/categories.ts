export type ChatCategoryId = "all" | "personal" | "group" | "channel" | "bot";

export const CHAT_CATEGORIES = [
  { id: "all", label: "Hammasi" },
  { id: "personal", label: "Shaxsiy" },
  { id: "group", label: "Guruhlar" },
  { id: "channel", label: "Kanallar" },
  { id: "bot", label: "Bot" },
] as const satisfies ReadonlyArray<{ id: ChatCategoryId; label: string }>;
