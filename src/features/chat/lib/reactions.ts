export const QUICK_REACTIONS = ["❤️", "🤝", "👍", "😁", "🆒", "⚡", "😎"] as const;

export function formatViewCount(count: number): string {
  if (count >= 1_000_000) {
    const value = count / 1_000_000;
    return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    const value = count / 1_000;
    return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(count);
}

export function getUserReactionEmoji(
  reactions: Array<{ emoji: string; userIds: string[] }> | undefined,
  currentUserId: string,
): string | null {
  if (!reactions?.length) return null;
  for (const reaction of reactions) {
    if (reaction.userIds.includes(currentUserId)) {
      return reaction.emoji;
    }
  }
  return null;
}

export function messageHasDownloadableMedia(message: {
  attachments?: Array<{ kind: string; url: string; name?: string }>;
}): boolean {
  return (
    message.attachments?.some((a) => a.kind === "image" || a.kind === "video") ??
    false
  );
}

export function getFirstDownloadableAttachment(message: {
  attachments?: Array<{ kind: string; url: string; name?: string }>;
}) {
  return message.attachments?.find((a) => a.kind === "image" || a.kind === "video");
}
