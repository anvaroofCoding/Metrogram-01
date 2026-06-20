import type { Country } from "../data/countries";
import { COUNTRIES, getLocalDigitCount } from "../data/countries";

/** Bo'sh maska: +998 -- --- -- -- */
export function buildEmptyMask(country: Country): string {
  const segments = country.groups.map((g) => "-".repeat(g));
  return `+${country.dialCode} ${segments.join(" ")}`;
}

/** Raqamlar bilan maska: +998 94 793 20 05 */
export function formatMaskedPhone(country: Country, localDigits: string): string {
  const digits = localDigits.replace(/\D/g, "").slice(0, getLocalDigitCount(country));
  const segments: string[] = [];
  let index = 0;

  for (const size of country.groups) {
    const chunk = digits.slice(index, index + size);
    if (chunk.length === 0) {
      segments.push("-".repeat(size));
    } else if (chunk.length < size) {
      segments.push(chunk + "-".repeat(size - chunk.length));
    } else {
      segments.push(chunk);
    }
    index += size;
  }

  return `+${country.dialCode} ${segments.join(" ")}`;
}

export function toE164(country: Country, localDigits: string): string {
  const digits = localDigits.replace(/\D/g, "").slice(0, getLocalDigitCount(country));
  return `+${country.dialCode}${digits}`;
}

export function isPhoneComplete(country: Country, localDigits: string): boolean {
  return localDigits.replace(/\D/g, "").length === getLocalDigitCount(country);
}

/** E.164 dan mamlakat va mahalliy raqamni ajratish */
export function parseE164(phone: string): { country: Country; localDigits: string } | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  // Eng uzun dial code birinchi tekshiriladi
  const sorted = [...COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length,
  );

  for (const country of sorted) {
    if (digits.startsWith(country.dialCode)) {
      return {
        country,
        localDigits: digits.slice(country.dialCode.length),
      };
    }
  }
  return null;
}

export function formatE164Display(phone: string): string {
  const parsed = parseE164(phone);
  if (!parsed) return phone;
  return formatMaskedPhone(parsed.country, parsed.localDigits);
}
