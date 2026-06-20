import { compressImageFile } from "@/lib/compress-image";
import { uploadAttachment } from "@/lib/uploads";

/** Rasmni siqib serverga yuklaydi va doimiy URL qaytaradi. */
export async function uploadAvatarImage(file: File): Promise<string> {
  const dataUrl = await compressImageFile(file);
  const blob = await fetch(dataUrl).then((response) => response.blob());
  const safeName = file.name.replace(/[^\w.-]+/g, "_").replace(/\.[^.]+$/, "") || "avatar";
  const attachment = await uploadAttachment(blob, `${safeName}.jpg`);
  return attachment.url;
}
