import { useState } from "react";
import { useAuth } from "@/features/auth/auth-store";
import { cn } from "@/lib/utils";
import { resolveMediaUrl, markMediaUrlFailed } from "@/lib/files";
import type { UserProfile } from "../types";

interface ProfileAvatarProps {
  profile: UserProfile | null;
  size?: "md" | "lg" | "xl";
  className?: string;
}

const SIZE = {
  md: "h-12 w-12 text-base",
  lg: "h-24 w-24 text-3xl",
  xl: "h-28 w-28 text-4xl",
} as const;

export function ProfileAvatar({ profile, size = "md", className }: ProfileAvatarProps) {
  const { user } = useAuth();
  const dim = SIZE[size];
  const [imgFailed, setImgFailed] = useState(false);
  const avatarUrl = profile?.avatarUrl ?? user?.avatarUrl;
  const avatarSrc = resolveMediaUrl(avatarUrl);
  const avatarEmoji =
    profile?.avatarEmoji ?? user?.avatarEmoji ?? profile?.name?.charAt(0) ?? user?.name?.charAt(0);
  const avatarColor = profile?.avatarColor ?? user?.avatarColor ?? "#00bbff";

  if (avatarSrc && !imgFailed) {
    return (
      <img
        src={avatarSrc}
        alt=""
        onError={() => {
          markMediaUrlFailed(avatarUrl);
          setImgFailed(true);
        }}
        className={cn("shrink-0 rounded-full object-cover", dim, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        dim,
        className,
      )}
      style={{ backgroundColor: avatarColor }}
    >
      {avatarEmoji || "?"}
    </div>
  );
}
