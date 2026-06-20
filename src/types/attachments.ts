export type AttachmentKind = "image" | "video" | "pdf" | "json" | "file" | "voice";

export interface MessageAttachment {
  id: string;
  kind: AttachmentKind;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  /** Ovozli xabar davomiyligi (soniya) */
  duration?: number;
  /** Ovozli xabar waveform (0–1) */
  waveform?: number[];
}

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  kind: AttachmentKind;
  previewUrl?: string;
}

export interface Tool {
  name: string;
  category: string;
  description: string;
}
