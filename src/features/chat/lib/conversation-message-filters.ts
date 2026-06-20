import type { MessageAttachment } from "@/types/attachments";
import type { Message } from "@/types/chat";

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

export interface ConversationMediaItem {
  id: string;
  url: string;
  name: string;
  kind: "image" | "video";
  createdAt: string;
}

export interface ConversationVoiceItem {
  id: string;
  url: string;
  duration?: number;
  createdAt: string;
}

export interface ConversationFileItem {
  id: string;
  name: string;
  kind: MessageAttachment["kind"];
  url: string;
  createdAt: string;
}

export interface ConversationLinkItem {
  id: string;
  url: string;
  title: string;
  createdAt: string;
}

export interface ConversationMessageFilters {
  media: ConversationMediaItem[];
  stories: ConversationMediaItem[];
  voice: ConversationVoiceItem[];
  files: ConversationFileItem[];
  links: ConversationLinkItem[];
}

function isMediaKind(kind: MessageAttachment["kind"]): kind is "image" | "video" {
  return kind === "image" || kind === "video";
}

function isFileKind(kind: MessageAttachment["kind"]): boolean {
  return kind === "pdf" || kind === "json" || kind === "file";
}

export function filterConversationMessages(messages: Message[]): ConversationMessageFilters {
  const media: ConversationMediaItem[] = [];
  const stories: ConversationMediaItem[] = [];
  const voice: ConversationVoiceItem[] = [];
  const files: ConversationFileItem[] = [];
  const links: ConversationLinkItem[] = [];
  const seenLinks = new Set<string>();

  for (const message of messages) {
    for (const attachment of message.attachments ?? []) {
      if (isMediaKind(attachment.kind)) {
        const item: ConversationMediaItem = {
          id: attachment.id,
          url: attachment.url,
          name: attachment.name,
          kind: attachment.kind,
          createdAt: message.createdAt,
        };
        media.push(item);
        if (attachment.kind === "image") {
          stories.push(item);
        }
      }

      if (attachment.kind === "voice") {
        voice.push({
          id: attachment.id,
          url: attachment.url,
          duration: attachment.duration,
          createdAt: message.createdAt,
        });
      }

      if (isFileKind(attachment.kind)) {
        files.push({
          id: attachment.id,
          name: attachment.name,
          kind: attachment.kind,
          url: attachment.url,
          createdAt: message.createdAt,
        });
      }
    }

    const matches = message.content.match(URL_REGEX) ?? [];
    for (const rawUrl of matches) {
      const url = rawUrl.replace(/[.,;:!?)]+$/, "");
      if (seenLinks.has(url)) continue;
      seenLinks.add(url);
      links.push({
        id: `${message.id}-${url}`,
        url,
        title: url,
        createdAt: message.createdAt,
      });
    }
  }

  return { media, stories, voice, files, links };
}

export function formatVoiceDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatMessageDate(iso: string): string {
  return new Date(iso).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
  });
}
