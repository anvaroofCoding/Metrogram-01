export type MessageMenuAction =
  | "delete"
  | "edit"
  | "pin"
  | "copy"
  | "reply"
  | "select"
  | "forward"
  | "download";

export interface MessageContextState {
  messageId: string;
  x: number;
  y: number;
}

export interface ComposerDraft {
  mode: "reply" | "edit" | "forward";
  message: import("@/types/chat").Message;
}
