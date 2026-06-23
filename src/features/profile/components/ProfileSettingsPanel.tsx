import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { AvatarLightboxTrigger } from "@/components/ui/avatar-lightbox-trigger";
import { useAuth } from "@/features/auth/auth-store";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import {
  SettingsCard,
  SettingsInfoRow,
  SettingsMenuRow,
} from "@/features/profile/components/SettingsCard";
import { useProfile } from "@/features/profile/profile-store";
import { LOCALE_LABELS, type AppLocale } from "@/i18n/config";
import { useAppLocale } from "@/i18n/useAppLocale";
import { cn } from "@/lib/utils";

interface ProfileSettingsPanelProps {
  onBack: () => void;
  onEdit: () => void;
}

export function ProfileSettingsPanel({ onBack, onEdit }: ProfileSettingsPanelProps) {
  const { t } = useTranslation();
  const { locale, localeShortLabels, setLocale, locales } = useAppLocale();
  const { profile, displayName, isLoading, error } = useProfile();
  const { formatPhoneDisplay, logout } = useAuth();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
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
          {isLoading ? t("settings.profileLoading") : t("settings.profileNotFound")}
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
          aria-label={t("common.back")}
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-zinc-900 dark:text-white">
          {t("settings.title")}
        </h1>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={t("settings.qrCode")}
          >
            <Icon icon={IconQrCode} size={20} />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={t("settings.editProfile")}
          >
            <Icon icon={IconPencil} size={20} />
          </button>
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label={t("settings.more")}
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
                    {t("settings.logOut")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-4">
        <div className="mb-4 flex flex-col items-center">
          <AvatarLightboxTrigger avatarUrl={profile.avatarUrl} name={displayName}>
            <ProfileAvatar profile={profile} size="lg" />
          </AvatarLightboxTrigger>
          <h2 className="mt-3 text-center text-lg font-semibold text-zinc-900 dark:text-white">
            {displayName}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
            <Icon icon={IconShield} size={14} className="text-[#00bbff]" />
            {t("presence.online")}
          </p>
        </div>

        <SettingsCard className="mb-3">
          <SettingsInfoRow
            icon={<Icon icon={IconCall} size={20} />}
            value={formattedPhone}
            label={t("settings.phone")}
          />
          <SettingsInfoRow
            icon={<span className="text-base font-medium">@</span>}
            value={profile.username || "—"}
            label={t("settings.username")}
          />
          <SettingsInfoRow
            icon={<Icon icon={IconInfo} size={20} />}
            value={profile.bio || "—"}
            label={t("settings.bio")}
            showDivider={false}
          />
        </SettingsCard>

        {error && (
          <p className="mb-3 px-2 text-center text-xs text-amber-600">{error}</p>
        )}

        <SettingsCard className="mb-3">
          <SettingsMenuRow
            icon={<Icon icon={IconNotifications} size={20} />}
            label={t("settings.notifications")}
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconStorage} size={20} />}
            label={t("settings.dataStorage")}
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconLock} size={20} />}
            label={t("settings.privacy")}
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconSettings} size={20} />}
            label={t("settings.general")}
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconFolder} size={20} />}
            label={t("settings.chatFolders")}
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconEmoji} size={20} />}
            label={t("settings.stickers")}
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconVideo} size={20} />}
            label={t("settings.speakers")}
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconDevices} size={20} />}
            label={t("settings.devices")}
            trailing="1"
            disabled
          />
          <div className="relative">
            <SettingsMenuRow
              icon={<Icon icon={IconLanguage} size={20} />}
              label={t("settings.language")}
              trailing={localeShortLabels[locale]}
              onClick={() => setLanguageOpen((v) => !v)}
            />
            {languageOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLanguageOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-4 top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-xl bg-white py-1 shadow-xl dark:bg-[#2b2b2b]">
                  {locales.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setLocale(code as AppLocale);
                        setLanguageOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center px-4 py-2.5 text-left text-[15px] transition-colors",
                        code === locale
                          ? "bg-[#00bbff]/10 text-[#00bbff]"
                          : "text-zinc-900 hover:bg-zinc-50 dark:text-white dark:hover:bg-zinc-800/60",
                      )}
                    >
                      {LOCALE_LABELS[code]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <SettingsMenuRow
            icon={<Icon icon={IconKeyboard} size={20} />}
            label={t("settings.keyboard")}
            showDivider={false}
            disabled
          />
        </SettingsCard>

        <SettingsCard>
          <SettingsMenuRow
            icon={<Icon icon={IconStar} size={20} className="text-[#00bbff]" />}
            label={t("settings.premium")}
            disabled
          />
          <SettingsMenuRow
            icon={<Icon icon={IconGift} size={20} />}
            label={t("settings.gift")}
            showDivider={false}
            disabled
          />
        </SettingsCard>
      </div>
    </div>
  );
}
