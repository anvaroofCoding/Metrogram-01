import type { Message, MessageStatus } from "@/types/chat";

export function resolveOutgoingStatus(
  message: Message,
  peerLastReadAt?: string | null,
): MessageStatus {
  if (message.status === "sending" || message.status === "failed") {
    return message.status;
  }

  if (peerLastReadAt) {
    const readAt = new Date(peerLastReadAt).getTime();
    const sentAt = new Date(message.createdAt).getTime();
    if (!Number.isNaN(readAt) && !Number.isNaN(sentAt) && sentAt <= readAt) {
      return "read";
    }
  }

  if (message.status === "delivered") return "delivered";

  return "sent";
}
