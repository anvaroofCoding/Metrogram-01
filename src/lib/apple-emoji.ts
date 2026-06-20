import emojiData from "emoji-datasource/emoji.json";

export const APPLE_EMOJI_CDN =
  "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.1/img/apple/64";

type EmojiRecord = {
  unified?: string;
  non_qualified?: string | null;
  image?: string;
  has_img_apple?: boolean;
  skin_variations?: Record<string, { unified?: string; image?: string }>;
};

function unifiedToNative(unified: string): string {
  return unified
    .split("-")
    .map((hex) => String.fromCodePoint(parseInt(hex, 16)))
    .join("");
}

function registerNative(map: Map<string, string>, native: string, image: string) {
  if (!native || !image) return;
  const key = image.replace(/\.png$/i, "");
  map.set(native, key);
  map.set(native.normalize("NFC"), key);
  map.set(native.normalize("NFD"), key);
}

const nativeToImageKey = new Map<string, string>();

for (const item of emojiData as EmojiRecord[]) {
  if (!item.has_img_apple || !item.image) continue;

  if (item.unified) {
    registerNative(nativeToImageKey, unifiedToNative(item.unified), item.image);
  }
  if (item.non_qualified) {
    registerNative(nativeToImageKey, unifiedToNative(item.non_qualified), item.image);
  }

  if (item.skin_variations) {
    for (const variant of Object.values(item.skin_variations)) {
      if (variant.unified && variant.image) {
        registerNative(nativeToImageKey, unifiedToNative(variant.unified), variant.image);
      }
    }
  }
}

function fallbackImageKey(emoji: string): string {
  const points: string[] = [];
  for (const char of emoji) {
    const cp = char.codePointAt(0);
    if (cp === undefined) continue;
    points.push(cp.toString(16).toLowerCase());
  }
  return points.join("-");
}

export function getAppleEmojiImageKey(emoji: string): string {
  const normalized = emoji.normalize("NFC");
  return (
    nativeToImageKey.get(normalized) ??
    nativeToImageKey.get(emoji) ??
    fallbackImageKey(emoji)
  );
}

export function getAppleEmojiSrc(emoji: string): string {
  return `${APPLE_EMOJI_CDN}/${getAppleEmojiImageKey(emoji)}.png`;
}

export function isEmojiSegment(segment: string): boolean {
  if (!segment) return false;
  return /\p{Extended_Pictographic}/u.test(segment);
}

export function splitTextAndEmoji(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map(
      (part) => part.segment,
    );
  }
  return [...text];
}
