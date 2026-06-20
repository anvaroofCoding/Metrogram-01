import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/features/auth/auth-session";
import { useAuth } from "@/features/auth/auth-store";
import { writeAuthUser } from "@/features/auth/auth-session";
import {
  toUserProfile,
  type RegisteredUser,
  type UpdateUserInput,
} from "@/features/users/lib/user-mappers";
import { apiFetch } from "@/lib/api-client";
import { createFallbackProfile, getDisplayName } from "./default-profile";
import type { ProfileUpdate, UserProfile } from "./types";

interface ProfileContextValue {
  profile: UserProfile | null;
  displayName: string;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: ProfileUpdate) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function syncAuthSession(
  currentUser: AuthUser,
  nextProfile: UserProfile,
  phone: string,
  refreshAccounts: () => void,
) {
  const fullName = [nextProfile.name, nextProfile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const nextAuth: AuthUser = {
    ...currentUser,
    name: fullName || currentUser.name,
    username: nextProfile.username,
    phone,
    avatarUrl: nextProfile.avatarUrl,
    avatarEmoji: nextProfile.avatarEmoji,
    avatarColor: nextProfile.avatarColor,
  };

  const changed =
    nextAuth.name !== currentUser.name ||
    nextAuth.username !== currentUser.username ||
    nextAuth.avatarUrl !== currentUser.avatarUrl ||
    nextAuth.avatarEmoji !== currentUser.avatarEmoji ||
    nextAuth.avatarColor !== currentUser.avatarColor;

  if (!changed) return;

  writeAuthUser(nextAuth);
  refreshAccounts();
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, refreshAccounts } = useAuth();
  const userId = user?.id;
  const userRef = useRef(user);
  userRef.current = user;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) {
      setProfile(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setProfile(createFallbackProfile(currentUser));

    const fetchProfile = () => apiFetch<RegisteredUser>("/api/users/me");

    const isRetryableError = (message: string) =>
      message.includes("502") ||
      message.includes("503") ||
      message.includes("429") ||
      message.includes("Juda ko'p") ||
      message.includes("Serverga ulanib bo'lmadi") ||
      message.includes("Backend ishlamayapti");

    try {
      let data: RegisteredUser;
      try {
        data = await fetchProfile();
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (!isRetryableError(message)) throw err;
        await new Promise((resolve) => setTimeout(resolve, message.includes("429") ? 2500 : 1500));
        data = await fetchProfile();
      }

      if (data.phone !== currentUser.phone) {
        throw new Error("Profil ma'lumotlari mos kelmadi");
      }
      const nextProfile = toUserProfile(data);
      setProfile(nextProfile);
      syncAuthSession(currentUser, nextProfile, data.phone, refreshAccounts);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Profil yuklanmadi";
      setProfile(createFallbackProfile(currentUser));
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [refreshAccounts]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setProfile(null);
      setError(null);
      return;
    }
    void refreshProfile();
  }, [isAuthenticated, userId, refreshProfile]);

  const updateProfile = useCallback(
    async (patch: ProfileUpdate) => {
      const currentUser = userRef.current;
      if (!currentUser || !profile) return;

      const data: UpdateUserInput = {
        firstName: patch.name?.trim() || profile.name,
        lastName: patch.lastName?.trim() ?? profile.lastName,
        bio: patch.bio?.trim(),
        username: patch.username?.trim().replace(/^@/, "") || profile.username,
        position: patch.position?.trim(),
        avatarUrl: patch.avatarUrl,
      };

      const updated = await apiFetch<RegisteredUser>("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (updated.phone !== currentUser.phone) {
        throw new Error("Faqat o'z profilingizni tahrirlashingiz mumkin");
      }

      const nextProfile = toUserProfile(updated);
      setProfile(nextProfile);
      syncAuthSession(currentUser, nextProfile, updated.phone, refreshAccounts);
    },
    [profile, refreshAccounts],
  );

  const displayName = useMemo(() => {
    if (profile) return getDisplayName(profile);
    if (user) return user.name;
    return "";
  }, [profile, user]);

  const value = useMemo(
    () => ({
      profile,
      displayName,
      isLoading,
      error,
      refreshProfile,
      updateProfile,
    }),
    [profile, displayName, isLoading, error, refreshProfile, updateProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
