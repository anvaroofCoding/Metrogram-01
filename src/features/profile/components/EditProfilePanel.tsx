import { useEffect, useRef, useState } from "react";
import { Icon, IconCamera, IconChevronBack, IconMegaphone } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { SettingsCard } from "@/features/profile/components/SettingsCard";
import { useProfile } from "@/features/profile/profile-store";
import { uploadAvatarFile } from "@/lib/uploads";

interface EditProfilePanelProps {
  onBack: () => void;
}

export function EditProfilePanel({ onBack }: EditProfilePanelProps) {
  const { profile, updateProfile } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [position, setPosition] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setLastName(profile.lastName);
    setBio(profile.bio);
    setUsername(profile.username);
    setPosition(profile.position);
    setAvatarUrl(profile.avatarUrl);
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setError(null);
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim() || profile.name,
        lastName: lastName.trim(),
        bio: bio.trim(),
        username: username.trim().replace(/^@/, ""),
        position: position.trim(),
        avatarUrl,
      });
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploadingPhoto(true);
    try {
      setAvatarUrl(await uploadAvatarFile(file));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Rasm yuklanmadi. Boshqa fayl tanlang.",
      );
    } finally {
      setUploadingPhoto(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!profile) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[28px] bg-[#f4f4f5] dark:bg-[#0f0f0f]">
        <p className="text-sm text-zinc-500">Profil yuklanmoqda...</p>
      </div>
    );
  }

  const draftProfile = {
    ...profile,
    avatarUrl,
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden rounded-[28px] bg-[#f4f4f5] dark:bg-[#0f0f0f]">
      <header className="flex shrink-0 items-center bg-white px-2 py-3 dark:bg-[#1e1e1e]">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Orqaga"
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-zinc-900 dark:text-white">
          Edit Profile
        </h1>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-full px-3 py-1.5 text-[15px] font-semibold text-[#00bbff] hover:bg-[#00bbff]/10 disabled:opacity-50"
        >
          {saving ? "..." : "Done"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-3 pb-8 pt-6">
        <div className="mb-6 flex justify-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPhoto}
            className="relative disabled:opacity-60"
            aria-label="Rasm yuklash"
          >
            <ProfileAvatar profile={draftProfile} size="lg" />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35">
              <Icon icon={IconCamera} size={28} className="text-white" />
            </span>
            {uploadingPhoto && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-xs font-medium text-white">
                ...
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handlePhotoChange(e.target.files?.[0])}
            />
          </button>
        </div>

        <SettingsCard className="mb-3 space-y-4 p-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ism"
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Familiya"
          />
          <Input
            label="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Software developer"
          />
          <Input
            label="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
          />
        </SettingsCard>

        <p className="mb-3 px-2 text-xs leading-relaxed text-zinc-500">
          Any details such as age, occupation or city. Example: 23 y.o. designer from San Francisco
        </p>

        <h3 className="mb-2 px-2 text-sm font-semibold text-[#00bbff]">Username</h3>
        <SettingsCard className="mb-3 p-4">
          <Input
            label="Username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
            placeholder="username"
          />
        </SettingsCard>
        <p className="mb-6 px-2 text-xs leading-relaxed text-zinc-500">
          People can find you by this username. Use a–z, 0–9 and underscores. Minimum 5 characters.
        </p>

        <h3 className="mb-2 px-2 text-sm font-semibold text-[#00bbff]">Personal Channel</h3>
        <SettingsCard>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Icon icon={IconMegaphone} size={20} className="text-zinc-400" />
            <span className="flex-1 text-[15px] text-zinc-900 dark:text-white">Channel</span>
            <button
              type="button"
              className="text-[15px] font-medium text-[#00bbff] hover:underline"
            >
              Add
            </button>
          </div>
        </SettingsCard>
        <p className="mt-2 px-2 text-xs text-zinc-500">
          Display the channel you manage in your profile.
        </p>

        {error && (
          <p className="mt-4 px-2 text-center text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
