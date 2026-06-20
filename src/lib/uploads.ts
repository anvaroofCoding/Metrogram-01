import { apiFetch } from "@/lib/api-client";
import { compressImageFile } from "@/lib/compress-image";
import type { AttachmentKind, MessageAttachment } from "@/types/attachments";

export function sanitizeMessageAttachment(
  attachment: MessageAttachment,
): MessageAttachment {
  const clean: MessageAttachment = {
    id: attachment.id,
    kind: attachment.kind,
    name: attachment.name,
    url: attachment.url,
  };
  if (attachment.mimeType) clean.mimeType = attachment.mimeType;
  if (attachment.size != null) clean.size = attachment.size;
  if (attachment.duration != null) clean.duration = attachment.duration;
  if (attachment.waveform?.length) clean.waveform = attachment.waveform;
  return clean;
}

async function prepareUploadPayload(
  file: File | Blob,
  name: string,
): Promise<{ blob: File | Blob; name: string }> {
  if (file instanceof File && file.type.startsWith("image/")) {
    const dataUrl = await compressImageFile(file, {
      maxWidth: 1280,
      maxHeight: 1280,
      maxBytes: 350_000,
    });
    const blob = await fetch(dataUrl).then((response) => response.blob());
    const safeName = name.replace(/\.[^.]+$/, "") || "photo";
    return { blob, name: `${safeName}.jpg` };
  }
  return { blob: file, name };
}

export async function uploadAttachment(
  file: File | Blob,
  name: string,
): Promise<MessageAttachment> {
  const { blob, name: uploadName } = await prepareUploadPayload(file, name);
  const formData = new FormData();
  formData.append("file", blob, uploadName);

  const attachment = await apiFetch<MessageAttachment>("/api/uploads", {
    method: "POST",
    body: formData,
  });
  return sanitizeMessageAttachment(attachment);
}

export async function uploadAttachments(
  files: Array<{ file: File | Blob; name: string; kind?: AttachmentKind }>,
): Promise<MessageAttachment[]> {
  return Promise.all(files.map((entry) => uploadAttachment(entry.file, entry.name)));
}

/** Profil rasmi uchun serverga yuklab, doimiy URL qaytaradi. */
export async function uploadAvatarFile(file: File): Promise<string> {
  const attachment = await uploadAttachment(file, file.name || "avatar.jpg");
  return attachment.url;
}
