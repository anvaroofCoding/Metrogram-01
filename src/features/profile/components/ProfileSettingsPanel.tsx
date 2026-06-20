import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Icon,
  IconCall,
  IconChevronBack,
  IconDevices,
  IconEmoji,
  IconFolder,
  IconGift,
  IconInfo,
  IconKeyboard,
  IconLanguage,
  IconLock,
  IconLogOut,
  IconMore,
  IconNotifications,
  IconPencil,
  IconQrCode,
  IconSettings,
  IconShield,
  IconStar,
  IconStorage,
  IconVideo,
} from "@/components/icons";
import { useAuth } from "@/features/auth/auth-store";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import {
  SettingsCard,
  SettingsInfoRow,
  SettingsMenuRow,
} from "@/features/profile/components/SettingsCard";
import { useProfile } from "@/features/profile/profile-store";

interface ProfileSettingsPanelProps {
  onBack: () => void;
  onEdit: () => void;
}

export function ProfileSettingsPanel({ onBack, onEdit }: ProfileSettingsPanelProps) {
  const { profile, displayName, isLoading, error } = useProfile();
  const { formatPhoneDisplay, logout } = useAuth();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const formattedPhone = profile ? formatPhoneDisplay(profile.phone) : "—";

  if (!profile) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[28px] bg-[#f4f4f5] dark:bg-[#0f0f0f]">
        <p className="text-sm text-zinc-500">
          {isLoading ? "Profil yuklanmoqda..." : "Profil topilmadi"}
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden rounded-[28px] bg-[#f4f4f5] dark:bg-[#0f0f0f]">
      <header className="relative flex shrink-0 items-center bg-white px-2 py-3 dark:bg-[#1e1e1e]">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Orqaga"
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-zinc-900 dark:text-white">
          Settings
        </h1>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="QR kod"
          >
            <Icon icon={IconQrCode} size={20} />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Profilni tahrirlash"
          >
            <Icon icon={IconPencil} size={20} />
          </button>
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Ko'proq"
            >
              <Icon icon={IconMore} size={20} />
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-xl bg-white py-1 shadow-xl dark:bg-[#2b2b2b]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-zinc-900 hover:bg-zinc-50 dark:text-white dark:hover:bg-zinc-800/60"
                  >
                    <Icon icon={IconLogOut} size={20} className="text-zinc-400" />
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-4">
        <div className="mb-4 flex flex-col items-center">
          <ProfileAvatar profile={profile} size="lg" />
          <h2 className="mt-3 text-center text-lg font-semibold text-zinc-900 dark:text-white">
            {displayName}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
            <Icon icon={IconShield} size={14} className="text-[#00bbff]" />
            online
          </p>
        </div>

        <SettingsCard className="mb-3">
          <SettingsInfoRow
            icon={<Icon icon={IconCall} size={20} />}
            value={formattedPhone}
            label="Phone"
          />
          <SettingsInfoRow
            icon={<span className="text-base font-medium">@</span>}
            value={profile.username || "—"}
            label="Username"
          />
          <SettingsInfoRow
            icon={<Icon icon={IconInfo} size={20} />}
            value={profile.bio || "—"}
            label="Bio"
            showDivider={false}
          />
        </SettingsCard>

        {error && (
          <p className="mb-3 px-2 text-center text-xs text-amber-600">{error}</p>
        )}

        <SettingsCard className="mb-3">
          <SettingsMenuRow
            icon={<Icon icon={IconNotifications} size={20} />}
            label="Notifications and Sounds"
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconStorage} size={20} />}
            label="Data and Storage"
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconLock} size={20} />}
            label="Privacy and Security"
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconSettings} size={20} />}
            label="General Settings"
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconFolder} size={20} />}
            label="Chat Folders"
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconEmoji} size={20} />}
            label="Stickers and Emoji"
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconVideo} size={20} />}
            label="Speakers and Camera"
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconDevices} size={20} />}
            label="Devices"
            trailing="1"
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconLanguage} size={20} />}
            label="Language"
            trailing="O'zbek"
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconKeyboard} size={20} />}
            label="Keyboard Shortcuts"
            showDivider={false}
            disabled
          />
        </SettingsCard>

        <SettingsCard>
          <SettingsMenuRow
            icon={<Icon icon={IconStar} size={20} className="text-[#00bbff]" />}
            label="Metrogram Premium"
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconGift} size={20} />}
            label="Send a Gift"
            showDivider={false}
            disabled
          />
        </SettingsCard>
      </div>
    </div>
  );
}
