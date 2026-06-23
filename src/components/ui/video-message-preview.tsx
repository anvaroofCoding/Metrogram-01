import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconZoomIn } from "@/components/icons";
import { resolveMediaUrl } from "@/lib/files";
import { cn } from "@/lib/utils";
import type { MessageAttachment } from "@/types/attachments";
import { ImageLightbox } from "./image-lightbox";
import { MediaHoverActions } from "./media-hover-actions";

interface VideoMessagePreviewProps {
  file: MessageAttachment;
  variant?: "sent" | "received";
  className?: string;
}

export function VideoMessagePreview({
  file,
  variant = "received",
  className,
}: VideoMessagePreviewProps) {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const videoUrl = resolveMediaUrl(file.url) ?? file.url;

  const openViewer = useCallback(() => {
    setLightboxOpen(true);
  }, []);

  return (
    <>
      <div
        className={cn(
          "group relative",
          variant === "sent" ? "ml-auto" : "mr-auto",
          className,
        )}
      >
        <button
          type="button"
          onClick={openViewer}
          className="relative block w-full cursor-pointer touch-manipulation overflow-hidden rounded-2xl shadow-lg outline-none ring-[#00bbff]/0 transition-[transform,box-shadow,ring-color] focus-visible:ring-2 active:scale-[0.98] md:hover:scale-[1.01] md:hover:ring-2"
          aria-label={t("message.enlargeVideo")}
        >
          <span className="relative block bg-black">
            <video
              src={`${videoUrl}#t=0.001`}
              muted
              playsInline
              preload="metadata"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              tabIndex={-1}
              aria-hidden
              className="pointer-events-none block max-h-[min(70vh,420px)] w-full max-w-[min(92vw,360px)] object-cover"
            >
              <track kind="captions" />
            </video>
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-lg text-white">
                ▶
              </span>
            </span>
            <span className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-90">
              <Icon icon={IconZoomIn} size={16} />
            </span>
          </span>
        </button>
        <MediaHoverActions url={videoUrl} filename={file.name ?? "video.mp4"} />
      </div>
      <ImageLightbox
        images={[{ id: file.id, url: videoUrl, name: file.name, kind: "video" }]}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
