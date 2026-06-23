import type { MessageAttachment } from "./attachments";

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  bio?: string;
  avatarUrl?: string;
  username?: string;
  birthYear?: number;
  channels?: string[];
  avatarEmoji?: string;
  avatarColor?: string;
  lastSeen?: string;
  lastSeenAt?: string;
  isPremium?: boolean;
}

/** Kontaktlar ro'yxati uchun alias */
export type Contact = User;

export interface MessageReplyQuote {
  messageId: string;
  senderId: string;
  senderName?: string;
  content: string;
}

export interface MessageForwardInfo {
  conversationId: string;
  conversationTitle?: string;
  messageId: string;
  senderName?: string;
}

export interface PinnedMessageInfo {
  id: string;
  content: string;
  senderName?: string;
  pinnedAt?: string;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
  count: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: MessageAttachment[];
  createdAt: string;
  status: MessageStatus;
  clientId?: string;
  replyTo?: MessageReplyQuote;
  forwardedFrom?: MessageForwardInfo;
  editedAt?: string;
  isDeleted?: boolean;
  reactions?: MessageReaction[];
  viewCount?: number;
}

export interface Conversation {
  id: string;
  title: string;
  participantIds: string[];
  ownerId?: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  /** Sidebar UI */
  avatarEmoji?: string;
  avatarColor?: string;
  avatarUrl?: string;
  timeLabel?: string;
  isVerified?: boolean;
  isVoiceMessage?: boolean;
  isRead?: boolean;
  /** Qarshi tomondagi foydalanuvchi oxirgi marta qachon o'qigan */
  peerLastReadAt?: string;
  lastSeen?: string;
  lastSeenAt?: string;
  username?: string;
  category?: string;
  /** Kanal uchun */
  description?: string;
  subscriberCount?: number;
  inviteLink?: string;
  isPublic?: boolean;
  pinnedMessage?: PinnedMessageInfo;
  /** Sidebar ro'yxatida pin */
  isPinned?: boolean;
  pinnedListAt?: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export type RealtimeEvent =
  | { type: "message:new"; payload: Message }
  | { type: "message:updated"; payload: Message }
  | { type: "message:deleted"; payload: { id: string; conversationId: string } }
  | { type: "typing"; payload: TypingIndicator }
  | { type: "conversation:updated"; payload: Conversation }
  | { type: "presence"; payload: { userId: string; status: "online" | "offline" } };

export interface SendMessageInput {
  conversationId: string;
  content: string;
  attachments?: MessageAttachment[];
  clientId?: string;
  replyToMessageId?: string;
  forwardFromMessageId?: string;
  forwardFromConversationId?: string;
}

export interface UpdateMessageInput {
  messageId: string;
  conversationId: string;
  content: string;
}

export interface PinMessageInput {
  conversationId: string;
  messageId: string;
  pinForAll?: boolean;
}

export interface ToggleReactionInput {
  messageId: string;
  emoji: string;
}

export interface RecordMessageViewsInput {
  messageIds: string[];
}

export interface PaginatedMessages {
  items: Message[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface UpdateConversationInput {
  conversationId: string;
  title?: string;
  description?: string;
  avatarUrl?: string;
  isPublic?: boolean;
}

export interface CreateChannelInput {
  title: string;
  description?: string;
  avatarUrl?: string;
  memberIds: string[];
}

export interface CreateGroupInput extends CreateChannelInput {
  isPublic?: boolean;
}
