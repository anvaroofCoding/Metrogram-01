import type { AuthUser } from "@/features/auth/auth-session";
import type { UserProfile } from "./types";

/** Faqat backend javob kelmaguncha vaqtincha ko'rsatish uchun minimal profil */
export function createFallbackProfile(user: AuthUser): UserProfile {
  const parts = user.name.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  return {
    id: user.id,
    name: firstName,
    lastName,
    username: user.username,
    bio: "",
    phone: user.phone,
    position: "",
    avatarEmoji: user.avatarEmoji ?? (firstName.charAt(0) || user.username.charAt(0) || "U").toUpperCase(),
    avatarColor: user.avatarColor ?? "#00bbff",
    avatarUrl: user.avatarUrl,
  };
}

export function getDisplayName(profile: UserProfile): string {
  const full = [profile.name, profile.lastName].filter(Boolean).join(" ").trim();
  if (profile.position) {
    return `${full} | ${profile.position}`;
  }
  return full;
}
