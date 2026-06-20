import { useState } from "react";
import { cn } from "@/lib/utils";
import { markMediaUrlFailed, resolveMediaUrl } from "@/lib/files";
import type { Contact } from "@/types/chat";

interface ContactAvatarProps {
  contact: Contact;
  size?: "md" | "lg";
  className?: string;
}

export function ContactAvatar({ contact, size = "md", className }: ContactAvatarProps) {
  const dim = size === "lg" ? "h-14 w-14 text-lg" : "h-12 w-12 text-base";
  const [imgFailed, setImgFailed] = useState(false);
  const avatarSrc = resolveMediaUrl(contact.avatarUrl);

  if (avatarSrc && !imgFailed) {
    return (
      <img
        src={avatarSrc}
        alt=""
        onError={() => {
          markMediaUrlFailed(contact.avatarUrl);
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
      style={{ backgroundColor: contact.avatarColor ?? "#00bbff" }}
    >
      {contact.avatarEmoji ?? contact.name.charAt(0)}
    </div>
  );
}
