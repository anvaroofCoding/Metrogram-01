import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { resetAccountSessionData } from "@/features/auth/account-switch";
import { loginRequest } from "@/features/auth/api/authApi";
import {
  addAuthAccount,
  clearAuthUser,
  MAX_AUTH_ACCOUNTS,
  readAuthAccounts,
  readAuthUser,
  removeAuthAccount,
  switchAuthAccount,
  writeAuthUser,
  type AuthUser,
} from "@/features/auth/auth-session";
import { formatE164Display } from "./lib/phone-mask";

function normalizePhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}

function formatPhoneDisplay(phone: string): string {
  return formatE164Display(phone);
}

export type LoginMode = "default" | "add";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accounts: AuthUser[];
  canAddAccount: boolean;
  phone: string | null;
  login: (phone: string, password: string, mode?: LoginMode) => Promise<boolean>;
  switchAccount: (userId: string) => void;
  logout: () => void;
  logoutAll: () => void;
  refreshAccounts: () => void;
  formatPhoneDisplay: (phone: string) => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<AuthUser[]>(() => readAuthAccounts());
  const [user, setUser] = useState<AuthUser | null>(() => readAuthUser());

  const syncFromStorage = useCallback((nextUser: AuthUser | null) => {
    setAccounts(readAuthAccounts());
    setUser(nextUser);
    resetAccountSessionData();
  }, []);

  const login = useCallback(async (rawPhone: string, password: string, mode: LoginMode = "default") => {
    try {
      const authUser = await loginRequest({
        phone: normalizePhone(rawPhone),
        password,
      });

      if (mode === "add") {
        const added = addAuthAccount(authUser);
        if (!added) return false;
      } else {
        writeAuthUser(authUser);
      }

      syncFromStorage(readAuthUser());
      return true;
    } catch {
      return false;
    }
  }, [syncFromStorage]);

  const switchAccount = useCallback(
    (userId: string) => {
      if (userId === user?.id) return;
      const next = switchAuthAccount(userId);
      if (!next) return;
      syncFromStorage(next);
    },
    [syncFromStorage, user?.id],
  );

  const logout = useCallback(() => {
    if (!user) return;
    const next = removeAuthAccount(user.id);
    if (next) {
      syncFromStorage(next);
    } else {
      setUser(null);
      setAccounts([]);
      clearAuthUser();
      resetAccountSessionData();
    }
  }, [syncFromStorage, user]);

  const refreshAccounts = useCallback(() => {
    setAccounts(readAuthAccounts());
    setUser(readAuthUser());
  }, []);

  const logoutAll = useCallback(() => {
    setUser(null);
    setAccounts([]);
    clearAuthUser();
    resetAccountSessionData();
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      accounts,
      canAddAccount: accounts.length < MAX_AUTH_ACCOUNTS,
      phone: user?.phone ?? null,
      login,
      switchAccount,
      logout,
      logoutAll,
      refreshAccounts,
      formatPhoneDisplay,
    }),
    [user, accounts, login, switchAccount, logout, logoutAll, refreshAccounts],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { MAX_AUTH_ACCOUNTS };
