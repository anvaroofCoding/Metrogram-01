import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { preloadImage, resolveMediaUrl } from "@/lib/files";

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
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ignoreBackdropCloseUntil = useRef(0);

  const current = images[index];
  const isVideo = current?.kind === "video";
  const currentUrl = current ? resolveMediaUrl(current.url) ?? current.url : undefined;

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      ignoreBackdropCloseUntil.current = Date.now() + 500;
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    if (dialog.open) dialog.close();
    document.body.style.overflow = "";
  }, [open]);

  useEffect(() => {
    if (!open || !current) return;
    setLoaded(isVideo);
    setVideoError(false);
    setZoom(1);
    videoRef.current?.pause();

    if (isVideo) return;

    setLoaded(false);
    if (!currentUrl) return;

    void preloadImage(currentUrl)
      .then(() => setLoaded(true))
      .catch(() => setLoaded(true));

    const next = images[index + 1];
    const prev = images[index - 1];
    if (next?.kind !== "video") {
      const nextUrl = next ? resolveMediaUrl(next.url) ?? next.url : undefined;
      if (nextUrl) void preloadImage(nextUrl).catch(() => undefined);
    }
    if (prev?.kind !== "video") {
      const prevUrl = prev ? resolveMediaUrl(prev.url) ?? prev.url : undefined;
      if (prevUrl) void preloadImage(prevUrl).catch(() => undefined);
    }
  }, [open, index, current, currentUrl, images, isVideo]);

  useEffect(() => {
    if (!open || !isVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      void video.play().catch(() => undefined);
    };

    if (video.readyState >= 2) {
      play();
      return;
    }

    video.addEventListener("loadeddata", play, { once: true });
    return () => video.removeEventListener("loadeddata", play);
  }, [open, isVideo, currentUrl]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
    setZoom(1);
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    setZoom(1);
  }, [images.length]);

  const requestClose = useCallback(() => {
    dialogRef.current?.close();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, requestClose, goPrev, goNext]);

  const handleDialogCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      if (Date.now() < ignoreBackdropCloseUntil.current) {
        event.preventDefault();
        return;
      }
      onClose();
    },
    [onClose],
  );

  if (!open || !current || !currentUrl) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className="media-lightbox m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/92"
      onClose={onClose}
      onCancel={handleDialogCancel}
    >
      <div
        className="relative flex h-full w-full flex-col bg-black/95"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            if (Date.now() < ignoreBackdropCloseUntil.current) return;
            requestClose();
          }
        }}
      >
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 safe-top">
          <button
            type="button"
            onClick={requestClose}
            className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label={t("common.close")}
          >
            <Icon icon={IconClose} size={22} />
          </button>
          {current.name && (
            <span className="max-w-xs truncate text-sm text-white/80">{current.name}</span>
          )}
        </div>

        <div className="absolute right-4 top-4 z-10 flex gap-2 safe-top">
          {!isVideo && (
            <>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label={t("common.zoomOut")}
              >
                <Icon icon={IconZoomOut} size={22} />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(5, z + 0.5))}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label={t("common.zoomIn")}
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
              onClick={goPrev}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label={t("common.prev")}
            >
              <Icon icon={IconChevronBack} size={26} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label={t("common.next")}
            >
              <Icon icon={IconChevronForward} size={26} />
            </button>
          </>
        )}

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
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
                key={currentUrl}
                src={currentUrl}
                controls
                autoPlay
                playsInline
                preload="auto"
                controlsList="nodownload"
                className="max-h-[calc(100dvh-2rem)] max-w-[min(96vw,1280px)] rounded-2xl bg-black object-contain shadow-2xl"
                onError={() => setVideoError(true)}
              >
                <track kind="captions" />
              </video>
            )
          ) : (
            <img
              src={currentUrl}
              alt={current.name ?? ""}
              className={cn(
                "max-h-[calc(100dvh-2rem)] max-w-[min(96vw,1280px)] rounded-2xl object-contain shadow-2xl transition-transform duration-200",
                !loaded && "hidden",
              )}
              style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              decoding="async"
              draggable={false}
              onLoad={() => setLoaded(true)}
              onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2))}
            />
          )}
        </div>

        {images.length > 1 && (
          <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-sm text-white/60 safe-bottom">
            {index + 1} / {images.length}
          </p>
        )}
      </div>
    </dialog>,
    document.body,
  );
}
