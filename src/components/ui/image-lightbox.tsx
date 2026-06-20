import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Icon,
  IconChevronBack,
  IconChevronForward,
  IconClose,
  IconZoomIn,
  IconZoomOut,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { preloadImage } from "@/lib/files";

export interface LightboxImage {
  id: string;
  url: string;
  name?: string;
  kind?: "image" | "video";
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const current = images[index];
  const isVideo = current?.kind === "video";

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) {
      setZoom(1);
      setLoaded(false);
      setVideoError(false);
      videoRef.current?.pause();
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || !current) return;
    setLoaded(isVideo);
    setVideoError(false);
    setZoom(1);
    videoRef.current?.pause();

    if (isVideo) return;

    setLoaded(false);
    void preloadImage(current.url).then(() => setLoaded(true));

    const next = images[index + 1];
    const prev = images[index - 1];
    if (next?.kind !== "video") {
      if (next) void preloadImage(next.url);
    }
    if (prev?.kind !== "video") {
      if (prev) void preloadImage(prev.url);
    }
  }, [open, index, current, images, isVideo]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
    setZoom(1);
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    setZoom(1);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  if (!open || !current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label={isVideo ? "Video ko'rish" : "Rasm ko'rish"}
    >
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          aria-label="Yopish"
        >
          <Icon icon={IconClose} size={22} />
        </button>
        {current.name && (
          <span className="max-w-xs truncate text-sm text-white/80">{current.name}</span>
        )}
      </div>

      <div className="absolute right-4 top-4 flex gap-2">
        {!isVideo && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.max(1, z - 0.5));
              }}
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Kichiklashtirish"
            >
              <Icon icon={IconZoomOut} size={22} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.min(5, z + 0.5));
              }}
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Kattalashtirish"
            >
              <Icon icon={IconZoomIn} size={22} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Oldingi"
          >
            <Icon icon={IconChevronBack} size={26} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Keyingi"
          >
            <Icon icon={IconChevronForward} size={26} />
          </button>
        </>
      )}

      <div
        className="flex h-[85vh] w-[90vw] items-center justify-center overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {!isVideo && !loaded && (
          <div className="h-64 w-64 animate-pulse rounded-2xl bg-white/10" />
        )}
        {isVideo ? (
          videoError ? (
            <p className="rounded-2xl bg-white/10 px-6 py-4 text-sm text-white/80">
              Video yuklanmadi
            </p>
          ) : (
            <video
              ref={videoRef}
              key={current.url}
              src={current.url}
              controls
              autoPlay
              playsInline
              preload="auto"
              className="h-[85vh] w-[90vw] rounded-2xl bg-black object-contain shadow-2xl"
              onError={() => setVideoError(true)}
            >
              <track kind="captions" />
            </video>
          )
        ) : (
          <img
            src={current.url}
            alt={current.name ?? ""}
            className={cn(
              "h-[85vh] w-[90vw] rounded-2xl object-contain shadow-2xl transition-transform duration-200",
              !loaded && "hidden",
            )}
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
            decoding="async"
            draggable={false}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setZoom((z) => (z > 1 ? 1 : 2));
            }}
          />
        )}
      </div>

      {images.length > 1 && (
        <p className="absolute bottom-6 text-sm text-white/60">
          {index + 1} / {images.length}
        </p>
      )}
    </div>,
    document.body,
  );
}
