import { resolveApiUrl } from "@/config/api-url";
import type { AttachmentKind, MessageAttachment, UploadedFile } from "@/types/attachments";

export function detectAttachmentKind(file: File): AttachmentKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "application/json" || file.name.endsWith(".json")) return "json";
  return "file";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function createUploadedFile(file: File): UploadedFile {
  const kind = detectAttachmentKind(file);
  const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const hasPreview = kind === "image" || kind === "video";
  return {
    id,
    file,
    name: file.name,
    kind,
    previewUrl: hasPreview ? URL.createObjectURL(file) : undefined,
  };
}

export function revokeUploadedFiles(files: UploadedFile[]): void {
  for (const f of files) {
    if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
  }
}

export function filesToAttachments(files: UploadedFile[]) {
  return files.map((f) => ({
    id: f.id,
    kind: f.kind,
    name: f.name,
    url: f.previewUrl ?? URL.createObjectURL(f.file),
    mimeType: f.file.type,
    size: f.file.size,
  }));
}

export function voiceToAttachment(
  voice: { url: string; blob: Blob; duration: number; waveform: number[] },
) {
  const id = `voice-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    kind: "voice" as const,
    name: "voice-message.webm",
    url: voice.url,
    mimeType: voice.blob.type,
    size: voice.blob.size,
    duration: voice.duration,
    waveform: voice.waveform,
  };
}

export function isVideoAttachment(
  attachment: Pick<MessageAttachment, "kind" | "mimeType" | "name">,
): boolean {
  if (attachment.kind === "video") return true;
  if (attachment.mimeType?.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|m4v|mkv|avi)(\?.*)?$/i.test(attachment.name);
}

export function isImageAttachment(
  attachment: Pick<MessageAttachment, "kind" | "mimeType" | "name">,
): boolean {
  if (attachment.kind === "image") return true;
  if (attachment.mimeType?.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(attachment.name);
}

/** Server yoki nisbiy yo'l, base64 va to'liq URL larni img src uchun normalizatsiya qiladi. */
const failedMediaUrls = new Set<string>();

export function markMediaUrlFailed(url?: string | null): void {
  if (!url?.trim()) return;
  failedMediaUrls.add(url.trim());
}

export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined;
  const value = url.trim();
  if (failedMediaUrls.has(value)) return undefined;
  if (
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }
  if (value.startsWith("/api/")) return resolveApiUrl(value);
  if (value.startsWith("/")) return value;
  if (!value.includes("/")) return resolveApiUrl(`/api/uploads/files/${value}`);
  return value;
}

export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

export async function downloadMediaUrl(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Yuklab olib bo'lmadi");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename || "download";
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
