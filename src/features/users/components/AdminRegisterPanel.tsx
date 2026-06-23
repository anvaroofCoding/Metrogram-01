import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Icon,
  IconAdd,
  IconCamera,
  IconChevronBack,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountrySelect } from "@/features/auth/components/CountrySelect";
import { PhoneMaskInput } from "@/features/auth/components/PhoneMaskInput";
import { DEFAULT_COUNTRY } from "@/features/auth/data/countries";
import { useRegisterUserMutation } from "@/features/users/api/usersApi";
import { compressImageFile } from "@/lib/compress-image";
import { cn } from "@/lib/utils";
import type { Country } from "@/features/auth/data/countries";

interface AdminRegisterPanelProps {
  onBack: () => void;
  onRegistered?: () => void;
}

export function AdminRegisterPanel({ onBack, onRegistered }: AdminRegisterPanelProps) {
  const { t } = useTranslation();
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [channelsText, setChannelsText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: registerUser, isLoading } = useRegisterUserMutation();

  const phone = useMemo(
    () => `+${country.dialCode}${phoneLocal}`,
    [country.dialCode, phoneLocal],
  );

  const canSubmit =
    phoneLocal.length >= 9 &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length >= 3 &&
    password.length >= 6 &&
    password === confirmPassword;

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarUrl(await compressImageFile(file));
    } catch {
      setError(t("common.photoUploadFailed"));
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (password !== confirmPassword) {
      setError("Parollar mos kelmaydi");
      return;
    }

    try {
      const channels = channelsText
        .split(/[\n,]/)
        .map((c) => c.trim())
        .filter(Boolean);

      await registerUser({
        phone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position: position.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl,
        username: username.trim().toLowerCase(),
        password,
        birthYear: birthYear ? Number(birthYear) : undefined,
        channels,
      });

      setPhoneLocal("");
      setFirstName("");
      setLastName("");
      setPosition("");
      setBio("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setBirthYear("");
      setChannelsText("");
      setAvatarUrl(undefined);
      onRegistered?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.saveError"));
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden rounded-[28px] bg-white dark:bg-[#1e1e1e]">
      <header className="flex shrink-0 items-center px-2 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label={t("common.back")}
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-zinc-900 dark:text-white">
          {t("admin.register")}
        </h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <p className="mb-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t("admin.services.registerDesc")}
        </p>

        <div className="mb-5 flex justify-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#00bbff] text-white shadow-lg hover:bg-[#00a3e0]"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <Icon icon={IconCamera} size={36} />
            )}
            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#00bbff] ring-4 ring-white dark:ring-[#1e1e1e]">
              <Icon icon={IconAdd} size={16} />
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <CountrySelect value={country} onChange={setCountry} />
            <PhoneMaskInput
              country={country}
              value={phoneLocal}
              onChange={setPhoneLocal}
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t("profile.name")}
              placeholder={t("profile.name")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label={t("profile.lastName")}
              placeholder={t("profile.lastName")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <Input
            label={t("profile.position")}
            placeholder={t("profile.positionPlaceholder")}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />

          <div className="relative">
            <label
              htmlFor="user-bio"
              className="absolute -top-2.5 left-3 z-10 bg-white px-1 text-xs font-medium text-[#00bbff] dark:bg-[#1e1e1e]"
            >
              {t("profile.bioOptional")}
            </label>
            <textarea
              id="user-bio"
              rows={3}
              placeholder={t("profile.bioOptional")}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={cn(
                "w-full resize-none rounded-xl border border-[#00bbff]/80 bg-transparent px-4 py-3.5 text-base",
                "text-zinc-900 dark:text-white placeholder:text-zinc-400",
                "focus:border-[#00bbff] focus:outline-none focus:ring-1 focus:ring-[#00bbff]/30",
              )}
            />
          </div>

          <Input
            label={t("profile.usernameOptional")}
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
          />

          <Input
            label={t("auth.password")}
            type="password"
            placeholder={t("admin.passwordMinPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <Input
            label={t("admin.confirmPassword")}
            type="password"
            placeholder={t("admin.confirmPasswordPlaceholder")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          <Input
            label={t("admin.birthYear")}
            placeholder={t("admin.birthYearPlaceholder")}
            type="number"
            min={1900}
            max={2100}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
          />

          <div className="relative">
            <label
              htmlFor="user-channels"
              className="absolute -top-2.5 left-3 z-10 bg-white px-1 text-xs font-medium text-[#00bbff] dark:bg-[#1e1e1e]"
            >
              {t("profile.channel")}
            </label>
            <textarea
              id="user-channels"
              rows={2}
              placeholder={t("admin.channelNamesPlaceholder")}
              value={channelsText}
              onChange={(e) => setChannelsText(e.target.value)}
              className={cn(
                "w-full resize-none rounded-xl border border-[#00bbff]/80 bg-transparent px-4 py-3.5 text-base",
                "text-zinc-900 dark:text-white placeholder:text-zinc-400",
                "focus:border-[#00bbff] focus:outline-none focus:ring-1 focus:ring-[#00bbff]/30",
              )}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <Button
            type="button"
            size="lg"
            disabled={!canSubmit || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? t("common.loading") : t("admin.register")}
          </Button>
        </div>
      </div>
    </div>
  );
}
