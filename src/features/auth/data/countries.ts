export interface Country {
  id: string;
  name: string;
  dialCode: string;
  flag: string;
  /** Milliy raqam guruhi: masalan [2,3,2,2] → 94 793 20 05 */
  groups: number[];
}

export const COUNTRIES: Country[] = [
  { id: "uz", name: "O'zbekiston", dialCode: "998", flag: "🇺🇿", groups: [2, 3, 2, 2] },
  { id: "af", name: "Afg'oniston", dialCode: "93", flag: "🇦🇫", groups: [2, 3, 4] },
  { id: "ru", name: "Rossiya", dialCode: "7", flag: "🇷🇺", groups: [3, 3, 2, 2] },
  { id: "kz", name: "Qozog'iston", dialCode: "7", flag: "🇰🇿", groups: [3, 3, 2, 2] },
  { id: "tj", name: "Tojikiston", dialCode: "992", flag: "🇹🇯", groups: [2, 3, 4] },
  { id: "kg", name: "Qirg'iziston", dialCode: "996", flag: "🇰🇬", groups: [3, 3, 3] },
  { id: "tm", name: "Turkmaniston", dialCode: "993", flag: "🇹🇲", groups: [2, 3, 4] },
  { id: "tr", name: "Turkiya", dialCode: "90", flag: "🇹🇷", groups: [3, 3, 4] },
  { id: "ae", name: "BAA", dialCode: "971", flag: "🇦🇪", groups: [2, 3, 4] },
  { id: "us", name: "AQSh", dialCode: "1", flag: "🇺🇸", groups: [3, 3, 4] },
  { id: "gb", name: "Buyuk Britaniya", dialCode: "44", flag: "🇬🇧", groups: [4, 3, 4] },
  { id: "de", name: "Germaniya", dialCode: "49", flag: "🇩🇪", groups: [3, 3, 4] },
  { id: "in", name: "Hindiston", dialCode: "91", flag: "🇮🇳", groups: [5, 5] },
  { id: "cn", name: "Xitoy", dialCode: "86", flag: "🇨🇳", groups: [3, 4, 4] },
  { id: "kr", name: "Janubiy Koreya", dialCode: "82", flag: "🇰🇷", groups: [2, 4, 4] },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]!;

export function getCountryByDialCode(dialCode: string): Country | undefined {
  return COUNTRIES.find((c) => c.dialCode === dialCode);
}

export function getLocalDigitCount(country: Country): number {
  return country.groups.reduce((sum, g) => sum + g, 0);
}
