import { useState, type MouseEvent, type ReactNode } from "react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { resolveMediaUrl } from "@/lib/files";
import { cn } from "@/lib/utils";

interface AvatarLightboxTriggerProps {
  avatarUrl?: string;
  name?: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function AvatarLightboxTrigger({
  avatarUrl,
  name,
  children,
  className,
  onClick,
}: AvatarLightboxTriggerProps) {
  const [open, setOpen] = useState(false);
  const src = resolveMediaUrl(avatarUrl);

  if (!src) {
    return <>{children}</>;
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) {
            setOpen(true);
          }
        }}
        className={cn(
          "cursor-zoom-in rounded-full transition hover:opacity-90 active:scale-[0.98]",
          className,
        )}
        aria-label={name ? `${name} profil rasmini ko'rish` : "Profil rasmini ko'rish"}
      >
        {children}
      </button>
      <ImageLightbox
        images={[{ id: avatarUrl ?? "avatar", url: src, name }]}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
