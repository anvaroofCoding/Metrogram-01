import { useState } from "react";
import { cn } from "@/lib/utils";
import { resolveMediaUrl, markMediaUrlFailed } from "@/lib/files";
import type { AuthUser } from "@/features/auth/auth-session";

interface AccountAvatarProps {
  account: AuthUser;
  size?: "sm" | "md";
  className?: string;
}

const SIZE = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
} as const;

export function AccountAvatar({ account, size = "sm", className }: AccountAvatarProps) {
  const dim = SIZE[size];
  const initial = account.avatarEmoji ?? account.name.charAt(0).toUpperCase();
  const [imgFailed, setImgFailed] = useState(false);
  const avatarSrc = resolveMediaUrl(account.avatarUrl);

  if (avatarSrc && !imgFailed) {
    return (
      <img
        src={avatarSrc}
        alt=""
        onError={() => {
          markMediaUrlFailed(account.avatarUrl);
          setImgFailed(true);
        }}
        className={cn("shrink-0 rounded-full object-cover", dim, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        dim,
        className,
      )}
      style={{ backgroundColor: account.avatarColor ?? "#8b5cf6" }}
    >
      {initial}
    </div>
  );
}
