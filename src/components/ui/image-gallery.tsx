import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconZoomIn } from "@/components/icons";
import { resolveMediaUrl } from "@/lib/files";
import { cn } from "@/lib/utils";
import { MediaHoverActions } from "./media-hover-actions";
import { ImageLightbox, type LightboxImage } from "./image-lightbox";

function normalizeGalleryImages(images: LightboxImage[]): LightboxImage[] {
  return images.map((image) => ({
    ...image,
    url: resolveMediaUrl(image.url) ?? image.url,
    kind: image.kind ?? "image",
  }));
}

interface ImageGalleryProps {
  images: LightboxImage[];
  variant?: "sent" | "received";
  className?: string;
}

export function ImageGallery({
  images,
  variant = "received",
  className,
}: ImageGalleryProps) {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const resolvedImages = useMemo(() => normalizeGalleryImages(images), [images]);
  const visible = useMemo(() => resolvedImages.slice(0, 5), [resolvedImages]);
  const extra = resolvedImages.length - visible.length;

  const openAt = useCallback((index: number) => {
    setStartIndex(index);
    setLightboxOpen(true);
  }, []);

  if (resolvedImages.length === 0) return null;

  const mediaButtonClass =
    "relative block w-full cursor-pointer touch-manipulation overflow-hidden rounded-2xl shadow-lg outline-none ring-[#00bbff]/0 transition-[transform,box-shadow,ring-color] focus-visible:ring-2 active:scale-[0.98] md:hover:scale-[1.01] md:hover:ring-2";

  const renderZoomHint = () => (
    <span className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-90 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
      <Icon icon={IconZoomIn} size={16} />
    </span>
  );

  if (resolvedImages.length === 1) {
    const image = resolvedImages[0];
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
            onClick={() => openAt(0)}
            className={mediaButtonClass}
            aria-label={t("message.enlargeImage")}
          >
            <img
              src={image.url}
              alt={image.name ?? ""}
              className="max-h-[min(70vh,420px)] w-full max-w-[min(92vw,360px)] object-cover"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            {renderZoomHint()}
          </button>
          <MediaHoverActions url={image.url} filename={image.name ?? "image.jpg"} />
        </div>
        <ImageLightbox
          images={resolvedImages}
          initialIndex={startIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "flex items-center py-2",
          variant === "sent" ? "justify-end" : "justify-start",
          className,
        )}
      >
        <div className="relative flex items-center pl-2">
          {visible.map((img, i) => (
            <div
              key={img.id}
              className={cn("group relative shrink-0", i > 0 && "-ml-10")}
              style={{ zIndex: visible.length - i }}
            >
              <button
                type="button"
                onClick={() => openAt(i)}
                className={cn(
                  mediaButtonClass,
                  "h-28 w-24 border-[3px] border-white dark:border-zinc-800",
                )}
                aria-label={t("message.enlargeImage")}
              >
                <img
                  src={img.url}
                  alt={img.name ?? ""}
                  className="h-full w-full object-cover"
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
                {i === visible.length - 1 && extra > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                    +{extra}
                  </span>
                )}
                {renderZoomHint()}
              </button>
              <MediaHoverActions url={img.url} filename={img.name ?? `image-${i + 1}.jpg`} />
            </div>
          ))}
        </div>
      </div>

      <ImageLightbox
        images={resolvedImages}
        initialIndex={startIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
