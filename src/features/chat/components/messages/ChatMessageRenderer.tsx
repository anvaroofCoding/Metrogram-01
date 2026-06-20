import { useState } from "react";
import { Icon, IconCheck, IconDocument, IconEye } from "@/components/icons";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/files";
import type { MessageAttachment } from "@/types/attachments";
import { ImageGallery } from "@/components/ui/image-gallery";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { MediaHoverActions } from "@/components/ui/media-hover-actions";
import { MessageBubble } from "@/components/ui/message-bubble";
import { VoiceMessageBubble } from "@/components/ui/voice-message/VoiceMessageBubble";
import { resolveOutgoingStatus } from "@/features/chat/lib/message-status";
import { formatTime } from "@/features/chat/lib/message-dates";
import { formatViewCount } from "@/features/chat/lib/reactions";
import { MessageStatusIcon } from "@/features/chat/components/messages/MessageStatusIcon";
import { MessageReplyQuoteView } from "@/features/chat/components/messages/MessageReplyQuote";
import { MessageReactionsRow } from "@/features/chat/components/messages/MessageReactionsRow";
import type { Message } from "@/types/chat";

interface ChatMessageRendererProps {
  messages: Message[];
  variant: "sent" | "received";
  peerLastReadAt?: string | null;
  highlightedMessageId?: string | null;
  isChannel?: boolean;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (messageId: string) => void;
  onContextMenu?: (message: Message, x: number, y: number) => void;
  onReplyQuoteClick?: (messageId: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}

function VideoAttachment({ file, variant }: { file: MessageAttachment; variant: "sent" | "received" }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className={cn("group relative", variant === "sent" ? "ml-auto" : "mr-auto")}>
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative block overflow-hidden rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <video
            src={file.url}
            muted
            playsInline
            preload="metadata"
            className="max-h-64 max-w-[280px] bg-black object-cover"
          >
            <track kind="captions" />
          </video>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white">
              ▶
            </span>
          </span>
        </button>
        <MediaHoverActions url={file.url} filename={file.name ?? "video.mp4"} />
      </div>
      <ImageLightbox
        images={[{ id: file.id, url: file.url, name: file.name, kind: "video" }]}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

function FileAttachmentCard({ file }: { file: MessageAttachment }) {
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-[180px] items-center gap-3 rounded-2xl bg-zinc-200/90 px-4 py-3 transition hover:bg-zinc-300/90 dark:bg-zinc-700/90 dark:hover:bg-zinc-600/90"
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          file.kind === "pdf"
            ? "bg-red-500/15 text-red-500"
            : "bg-zinc-300/50 text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300",
        )}
      >
        <Icon icon={IconDocument} size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-[11px] uppercase text-zinc-500">
          {file.kind}
          {file.size ? ` · ${formatFileSize(file.size)}` : ""}
        </p>
      </div>
    </a>
  );
}

function MessageMetaRow({
  message,
  variant,
  peerLastReadAt,
  isChannel,
}: {
  message: Message;
  variant: "sent" | "received";
  peerLastReadAt?: string | null;
  isChannel?: boolean;
}) {
  const status = variant === "sent" ? resolveOutgoingStatus(message, peerLastReadAt) : null;
  const views = message.viewCount ?? 0;

  return (
    <span
      className={cn(
        "mt-0.5 flex items-center gap-1 px-1 text-[11px] text-zinc-400",
        variant === "sent" ? "self-end" : "self-start",
      )}
    >
      {formatTime(message.createdAt)}
      {message.editedAt && <span>edited</span>}
      {isChannel && views > 0 && (
        <span className="inline-flex items-center gap-0.5">
          {formatViewCount(views)}
          <Icon icon={IconEye} size={12} className="opacity-80" />
        </span>
      )}
      {status && <MessageStatusIcon status={status} />}
    </span>
  );
}

export function ChatMessageRenderer({
  messages,
  variant,
  peerLastReadAt,
  highlightedMessageId,
  isChannel = false,
  selectionMode = false,
  selectedIds,
  onToggleSelect,
  onContextMenu,
  onReplyQuoteClick,
  onToggleReaction,
}: ChatMessageRendererProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-2",
        variant === "sent" && "items-end",
      )}
    >
      {messages.map((msg) => {
        const images =
          msg.attachments
            ?.filter((a) => a.kind === "image")
            .map((a) => ({ id: a.id, url: a.url, name: a.name })) ?? [];
        const voice = msg.attachments?.find((a) => a.kind === "voice");
        const videos = msg.attachments?.filter((a) => a.kind === "video") ?? [];
        const files =
          msg.attachments?.filter(
            (a) => a.kind !== "image" && a.kind !== "voice" && a.kind !== "video",
          ) ?? [];

        const highlighted = highlightedMessageId === msg.id;
        const selected = selectedIds?.has(msg.id) ?? false;

        return (
          <div
            key={msg.id}
            className={cn(
              "flex w-full gap-2",
              variant === "sent" ? "justify-end" : "justify-start",
              selectionMode && selected && "rounded-xl bg-[#00bbff]/10",
            )}
          >
            {selectionMode && (
              <button
                type="button"
                onClick={() => onToggleSelect?.(msg.id)}
                className={cn(
                  "mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
                  selected
                    ? "border-[#00bbff] bg-[#00bbff] text-white"
                    : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800",
                )}
                aria-label={selected ? "Tanlovni olib tashlash" : "Tanlash"}
              >
                {selected && <Icon icon={IconCheck} size={14} />}
              </button>
            )}

            <div
              id={`message-${msg.id}`}
              data-message-id={msg.id}
              onContextMenu={(event) => {
                if (selectionMode) return;
                event.preventDefault();
                onContextMenu?.(msg, event.clientX, event.clientY);
              }}
              className={cn(
                "flex w-max max-w-[min(75%,420px)] flex-col gap-2 scroll-mt-24 rounded-2xl transition",
                variant === "sent" ? "items-end" : "items-start",
                highlighted && "ring-2 ring-[#00bbff]/60 ring-offset-2 ring-offset-white dark:ring-offset-[#1e1e1e]",
              )}
            >
              {msg.forwardedFrom && (
                <p className="px-1 text-xs font-medium text-[#00bbff]">
                  Forwarded from {msg.forwardedFrom.senderName ?? msg.forwardedFrom.conversationTitle ?? "chat"}
                </p>
              )}

              {images.length > 0 && <ImageGallery images={images} variant={variant} />}
              {videos.map((video) => (
                <VideoAttachment key={video.id} file={video} variant={variant} />
              ))}
              {voice && <VoiceMessageBubble attachment={voice} variant={variant} />}
              {files.map((file) => (
                <FileAttachmentCard key={file.id} file={file} />
              ))}

              {(msg.replyTo || msg.content.trim()) && (
                <div className="w-full">
                  {msg.replyTo && (
                    <MessageReplyQuoteView
                      quote={msg.replyTo}
                      variant={variant}
                      onClick={() => onReplyQuoteClick?.(msg.replyTo!.messageId)}
                    />
                  )}
                  {msg.content.trim() && (
                    <MessageBubble message={msg.content} variant={variant} />
                  )}
                </div>
              )}

              <MessageReactionsRow
                reactions={msg.reactions}
                onToggle={(emoji) => onToggleReaction?.(msg.id, emoji)}
              />
              <MessageMetaRow
                message={msg}
                variant={variant}
                peerLastReadAt={peerLastReadAt}
                isChannel={isChannel}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
