import { pickAvatarColor } from "@/features/users/lib/user-mappers";

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  username: string;
  avatarEmoji?: string;
  avatarColor?: string;
  avatarUrl?: string;
}

export const AUTH_USER_STORAGE_KEY = "metrogram_auth_user";
export const AUTH_ACCOUNTS_STORAGE_KEY = "metrogram_auth_accounts";
export const AUTH_ACTIVE_ACCOUNT_ID_KEY = "metrogram_active_account_id";
export const MAX_AUTH_ACCOUNTS = 3;

function enrichAuthUser(user: AuthUser): AuthUser {
  const initial = user.name?.charAt(0)?.toUpperCase() || "?";
  return {
    ...user,
    avatarEmoji: user.avatarEmoji ?? initial,
    avatarColor: user.avatarColor ?? pickAvatarColor(user.id || user.username),
  };
}

function saveAccounts(accounts: AuthUser[]) {
  localStorage.setItem(
    AUTH_ACCOUNTS_STORAGE_KEY,
    JSON.stringify(accounts.map(enrichAuthUser)),
  );
}

function setActiveAccountId(userId: string) {
  localStorage.setItem(AUTH_ACTIVE_ACCOUNT_ID_KEY, userId);
  const user = readAuthAccounts().find((a) => a.id === userId);
  if (user) {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  }
}

function migrateLegacyAuthUser(): AuthUser[] {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.id || !parsed?.phone) return [];
    const accounts = [enrichAuthUser(parsed)];
    saveAccounts(accounts);
    setActiveAccountId(parsed.id);
    return accounts;
  } catch {
    return [];
  }
}

export function readAuthAccounts(): AuthUser[] {
  try {
    const raw = localStorage.getItem(AUTH_ACCOUNTS_STORAGE_KEY);
    if (!raw) return migrateLegacyAuthUser();
    const parsed = JSON.parse(raw) as AuthUser[];
    if (!Array.isArray(parsed)) return migrateLegacyAuthUser();
    return parsed.filter((a) => a?.id && a?.phone).map(enrichAuthUser);
  } catch {
    return migrateLegacyAuthUser();
  }
}

export function readActiveAccountId(): string | null {
  return localStorage.getItem(AUTH_ACTIVE_ACCOUNT_ID_KEY);
}

export function readAuthUser(): AuthUser | null {
  const accounts = readAuthAccounts();
  if (accounts.length === 0) return null;

  const activeId = readActiveAccountId();
  const active = activeId ? accounts.find((a) => a.id === activeId) : undefined;
  return active ?? accounts[0] ?? null;
}

export function writeAuthUser(user: AuthUser) {
  const enriched = enrichAuthUser(user);
  const accounts = readAuthAccounts();
  const index = accounts.findIndex((a) => a.id === enriched.id);
  if (index >= 0) {
    accounts[index] = enriched;
  } else if (accounts.length < MAX_AUTH_ACCOUNTS) {
    accounts.push(enriched);
  }
  saveAccounts(accounts);
  setActiveAccountId(enriched.id);
}

export function addAuthAccount(user: AuthUser): boolean {
  const enriched = enrichAuthUser(user);
  const accounts = readAuthAccounts();
  const existingIndex = accounts.findIndex((a) => a.id === enriched.id);

  if (existingIndex >= 0) {
    accounts[existingIndex] = enriched;
  } else {
    if (accounts.length >= MAX_AUTH_ACCOUNTS) return false;
    accounts.push(enriched);
  }

  saveAccounts(accounts);
  setActiveAccountId(enriched.id);
  return true;
}

export function switchAuthAccount(userId: string): AuthUser | null {
  const accounts = readAuthAccounts();
  const user = accounts.find((a) => a.id === userId);
  if (!user) return null;
  setActiveAccountId(userId);
  return user;
}

export function removeAuthAccount(userId: string): AuthUser | null {
  const accounts = readAuthAccounts().filter((a) => a.id !== userId);
  saveAccounts(accounts);

  if (accounts.length === 0) {
    clearAuthUser();
    return null;
  }

  const activeId = readActiveAccountId();
  const next =
    activeId && accounts.some((a) => a.id === activeId)
      ? accounts.find((a) => a.id === activeId)!
      : accounts[0];

  setActiveAccountId(next.id);
  return next;
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  localStorage.removeItem(AUTH_ACCOUNTS_STORAGE_KEY);
  localStorage.removeItem(AUTH_ACTIVE_ACCOUNT_ID_KEY);
  localStorage.removeItem("metrogram_profile");
}

export function getCurrentUserId(): string {
  return readAuthUser()?.id ?? "admin";
}

export function isAdminUser(user: AuthUser | null | undefined = readAuthUser()): boolean {
  return user?.id === "admin" || user?.username === "admin";
}

export function canAddAuthAccount(): boolean {
  return readAuthAccounts().length < MAX_AUTH_ACCOUNTS;
}
