import { useState } from "react";
import { pickAvatarColor } from "@/features/users/lib/user-mappers";
import { getAvatarInitial } from "@/features/chat/lib/conversation-display";
import { resolveMediaUrl, markMediaUrlFailed } from "@/lib/files";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

interface ChatAvatarProps {
  conversation: Conversation;
  selected?: boolean;
  size?: "sm" | "md" | "list" | "lg" | "xl";
}

const SIZE_MAP = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
  list: "h-[54px] w-[54px] text-lg",
  lg: "h-14 w-14 text-lg",
  xl: "h-28 w-28 text-3xl",
} as const;

export function ChatAvatar({ conversation, selected, size = "md" }: ChatAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const dim = SIZE_MAP[size];
  const title = conversation.title.trim();
  const letter = conversation.avatarEmoji ?? getAvatarInitial(title);
  const color =
    conversation.avatarColor ??
    pickAvatarColor(title || conversation.id);
  const avatarSrc = resolveMediaUrl(conversation.avatarUrl);

  if (avatarSrc && !imgFailed) {
    return (
      <img
        src={avatarSrc}
        alt=""
        onError={() => {
          markMediaUrlFailed(conversation.avatarUrl);
          setImgFailed(true);
        }}
        className={cn("shrink-0 rounded-full object-cover", dim)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        dim,
        selected && "ring-2 ring-white/30",
      )}
      style={{ backgroundColor: color }}
    >
      {letter}
    </div>
  );
}
