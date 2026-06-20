export interface UserProfile {
  id: string;
  name: string;
  lastName: string;
  username: string;
  bio: string;
  phone: string;
  position: string;
  avatarEmoji: string;
  avatarColor: string;
  avatarUrl?: string;
}

export type ProfileUpdate = Partial<Omit<UserProfile, "id" | "phone">>;
