import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Icon,
  IconBookmark,
  IconChevronForward,
  IconClose,
  IconLogOut,
  IconMoon,
  IconMore,
  IconPeople,
  IconPersonAdd,
  IconSettings,
  IconShield,
  IconStories,
  IconSun,
} from "@/components/icons";
import { useTheme } from "@/app/ThemeProvider";
import { AccountAvatar } from "@/features/auth/components/AccountAvatar";
import { useAuth, MAX_AUTH_ACCOUNTS } from "@/features/auth/auth-store";
import { isAdminUser } from "@/features/auth/auth-session";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { useProfile } from "@/features/profile/profile-store";
import { cn } from "@/lib/utils";

interface SideMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  onContactsClick?: () => void;
  onMyChannelsClick?: () => void;
  onAdminClick?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  suffix?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function MenuItem({ icon, label, suffix, onClick, className }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mx-2 flex w-[calc(100%-1rem)] items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-colors",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
        className,
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-zinc-500 dark:text-zinc-400">
        {icon}
      </span>
      <span className="flex-1 text-[15px] text-zinc-900 dark:text-white">{label}</span>
      {suffix}
    </button>
  );
}

function MenuDivider() {
  return <div className="mx-4 my-1 border-t border-zinc-100 dark:border-zinc-800" />;
}

export function SideMenuDrawer({
  open,
  onClose,
  onContactsClick,
  onMyChannelsClick,
  onAdminClick,
  onSettingsClick,
  onProfileClick,
}: SideMenuDrawerProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout, user, accounts, canAddAccount, switchAccount } = useAuth();
  const isAdmin = isAdminUser(user);
  const { profile, displayName } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) setMoreOpen(false);
  }, [open]);

  const handleLogout = () => {
    const willSignOutCompletely = accounts.length <= 1;
    logout();
    onClose();
    if (willSignOutCompletely) {
      navigate("/login", { replace: true });
    }
  };

  const handleAddAccount = () => {
    if (!canAddAccount) return;
    onClose();
    navigate("/login?add=1");
  };

  const handleSwitchAccount = (accountId: string) => {
    switchAccount(accountId);
    onClose();
  };

  if (!open) return null;

  const isDark = theme === "dark";
  const openProfile = onProfileClick ?? onSettingsClick;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        className={cn(
          "fixed left-4 top-4 z-50 w-72 overflow-visible rounded-2xl shadow-2xl",
          "bg-white dark:bg-[#212121]",
          "animate-in fade-in slide-in-from-left-4 duration-200",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={openProfile}
            className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:opacity-80"
          >
            <ProfileAvatar profile={profile} size="md" />
            <span className="truncate text-[15px] font-medium text-zinc-900 dark:text-white">
              {displayName}
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Yopish"
          >
            <Icon icon={IconClose} size={18} />
          </button>
        </div>

        {accounts.map((account) => {
          const isActive = account.id === user?.id;
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => handleSwitchAccount(account.id)}
              className={cn(
                "mx-2 mb-1 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-[#00bbff]/10"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
              )}
            >
              <AccountAvatar account={account} />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[15px] font-medium",
                  isActive ? "text-[#00bbff]" : "text-zinc-900 dark:text-white",
                )}
              >
                {account.name}
              </span>
              {isActive && (
                <span className="text-xs font-medium text-[#00bbff]">Faol</span>
              )}
            </button>
          );
        })}

        <MenuItem
          icon={<Icon icon={IconPersonAdd} size={22} />}
          label="Add Account"
          onClick={handleAddAccount}
          className={!canAddAccount ? "cursor-not-allowed opacity-50" : undefined}
        />
        {!canAddAccount && (
          <p className="mx-4 mb-1 text-center text-xs text-zinc-400">
            Maksimum {MAX_AUTH_ACCOUNTS} ta akkaunt
          </p>
        )}
        <MenuDivider />
        <MenuItem icon={<Icon icon={IconBookmark} size={22} />} label="Saved Messages" />
        <MenuItem
          icon={<Icon icon={IconStories} size={22} />}
          label="Kanallarim"
          onClick={onMyChannelsClick}
        />
        <MenuItem
          icon={<Icon icon={IconPeople} size={22} />}
          label="Contacts"
          onClick={onContactsClick}
        />
        {isAdmin && (
          <MenuItem
            icon={<Icon icon={IconShield} size={22} />}
            label="Admin"
            onClick={onAdminClick}
          />
        )}
        <MenuDivider />
        <MenuItem
          icon={<Icon icon={IconSettings} size={22} />}
          label="Settings"
          onClick={onSettingsClick}
        />

        <div className="relative pb-2">
          <MenuItem
            icon={<Icon icon={IconMore} size={22} />}
            label="More"
            suffix={<Icon icon={IconChevronForward} size={16} className="text-zinc-400" />}
            onClick={() => setMoreOpen((prev) => !prev)}
          />

          {moreOpen && (
            <div
              className={cn(
                "absolute left-full top-0 z-10 ml-1 w-64 overflow-hidden rounded-2xl shadow-2xl",
                "bg-white dark:bg-[#212121]",
                "animate-in fade-in slide-in-from-left-2 duration-150",
              )}
            >
              <MenuItem
                icon={<Icon icon={isDark ? IconSun : IconMoon} size={22} />}
                label={isDark ? "Enable Light Mode" : "Enable Dark Mode"}
                onClick={toggleTheme}
                className="my-1"
              />
              <MenuItem
                icon={<Icon icon={IconLogOut} size={22} />}
                label="Log out"
                onClick={handleLogout}
                className="mb-1"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
