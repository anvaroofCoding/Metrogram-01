import type { Contact } from "@/types/chat";
import type { UserProfile } from "@/features/profile/types";

const AVATAR_COLORS = ["#00bbff", "#ec4899", "#8b5cf6", "#f97316", "#14b8a6", "#6366f1", "#3b82f6"];

export function pickAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export interface RegisteredUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  name: string;
  position?: string;
  bio?: string;
  avatarUrl?: string;
  username: string;
  birthYear?: number;
  channels: string[];
  lastSeenAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterUserInput {
  phone: string;
  firstName: string;
  lastName: string;
  position?: string;
  bio?: string;
  avatarUrl?: string;
  username: string;
  birthYear?: number;
  channels?: string[];
  password: string;
}

export interface UpdateUserInput {
  phone?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  bio?: string;
  avatarUrl?: string;
  username?: string;
  birthYear?: number;
  channels?: string[];
  password?: string;
}

export function toContact(user: RegisteredUser): Contact {
  const initial = user.firstName?.charAt(0) || user.name?.charAt(0) || "?";
  return {
    id: user.id,
    name: user.name || `${user.firstName} ${user.lastName}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    position: user.position,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    username: user.username,
    birthYear: user.birthYear,
    channels: user.channels ?? [],
    avatarEmoji: initial.toUpperCase(),
    avatarColor: pickAvatarColor(user.name?.trim() || user.username || user.id),
    lastSeen: user.lastSeenAt ? undefined : user.position ? user.position : "contact",
    lastSeenAt: user.lastSeenAt,
  };
}

export function toUserProfile(user: RegisteredUser): UserProfile {
  return {
    id: user.id,
    name: user.firstName,
    lastName: user.lastName,
    username: user.username,
    bio: user.bio ?? "",
    phone: user.phone,
    position: user.position ?? "",
    avatarEmoji: (user.firstName?.charAt(0) || user.name?.charAt(0) || "U").toUpperCase(),
    avatarColor: pickAvatarColor(user.name?.trim() || user.username || user.id),
    avatarUrl: user.avatarUrl,
  };
}
