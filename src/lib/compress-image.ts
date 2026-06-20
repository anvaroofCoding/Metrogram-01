interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxBytes?: number;
}

/** Rasmni JPEG base64 ko'rinishida siqib, server limitidan oshmasligini ta'minlaydi. */
export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {},
): Promise<string> {
  const {
    maxWidth = 512,
    maxHeight = 512,
    quality = 0.82,
    maxBytes = 80_000,
  } = options;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Rasm qayta ishlanmadi");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let q = quality;
  let dataUrl = canvas.toDataURL("image/jpeg", q);

  while (dataUrl.length > maxBytes && q > 0.4) {
    q -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", q);
  }

  return dataUrl;
}
