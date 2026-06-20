import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { MediaHoverActions } from "./media-hover-actions";
import { ImageLightbox, type LightboxImage } from "./image-lightbox";

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const visible = useMemo(() => images.slice(0, 5), [images]);
  const extra = images.length - visible.length;

  if (images.length === 0) return null;

  const openAt = (index: number) => {
    setStartIndex(index);
    setLightboxOpen(true);
  };

  if (images.length === 1) {
    const image = images[0];
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
            className="block overflow-hidden rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <img
              src={image.url}
              alt={image.name ?? ""}
              className="max-h-64 max-w-[280px] object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
          <MediaHoverActions url={image.url} filename={image.name ?? "image.jpg"} />
        </div>
        <ImageLightbox
          images={images}
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
                className="relative h-28 w-24 overflow-hidden rounded-2xl border-[3px] border-white shadow-xl transition-transform hover:z-20 hover:scale-105 dark:border-zinc-800"
              >
                <img
                  src={img.url}
                  alt={img.name ?? ""}
                  className="h-full w-full object-cover"
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
                {i === visible.length - 1 && extra > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                    +{extra}
                  </span>
                )}
              </button>
              <MediaHoverActions url={img.url} filename={img.name ?? `image-${i + 1}.jpg`} />
            </div>
          ))}
        </div>
      </div>

      <ImageLightbox
        images={images}
        initialIndex={startIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
