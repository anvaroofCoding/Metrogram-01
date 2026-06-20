import { useMemo, useRef, useState } from "react";
import { compressImageFile } from "@/lib/compress-image";
import {
  Icon,
  IconCamera,
  IconChevronBack,
} from "@/components/icons";
import { Input } from "@/components/ui/input";
import { ContactAvatar } from "@/features/chat/components/create-channel/ContactAvatar";
import { useUpdateUserMutation } from "@/features/users/api/usersApi";
import { SettingsCard } from "@/features/profile/components/SettingsCard";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/chat";

interface AdminEditUserPanelProps {
  user: Contact;
  onBack: () => void;
  onSaved?: () => void;
}

function splitPhone(phone: string): { prefix: string; local: string } {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("998") && digits.length >= 12) {
    return { prefix: "+998", local: digits.slice(3) };
  }
  return { prefix: "+", local: digits };
}

export function AdminEditUserPanel({ user, onBack, onSaved }: AdminEditUserPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: updateUser, isLoading } = useUpdateUserMutation();

  const initialPhone = useMemo(() => splitPhone(user.phone ?? ""), [user.phone]);

  const [firstName, setFirstName] = useState(user.firstName ?? user.name.split(" ")[0] ?? "");
  const [lastName, setLastName] = useState(
    user.lastName ?? user.name.split(" ").slice(1).join(" ") ?? "",
  );
  const [phonePrefix] = useState(initialPhone.prefix);
  const [phoneLocal, setPhoneLocal] = useState(initialPhone.local);
  const [position, setPosition] = useState(user.position ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [birthYear, setBirthYear] = useState(user.birthYear ? String(user.birthYear) : "");
  const [channelsText, setChannelsText] = useState((user.channels ?? []).join(", "));
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const phone = `${phonePrefix}${phoneLocal.replace(/\D/g, "")}`;

  const draftContact: Contact = {
    ...user,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    avatarUrl,
  };

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      setAvatarUrl(await compressImageFile(file));
    } catch {
      setError("Rasm yuklanmadi. Boshqa fayl tanlang.");
    }
  };

  const handleSave = async () => {
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Ism va familiya majburiy");
      return;
    }

    if (username.trim().length > 0 && username.trim().length < 3) {
      setError("Username kamida 3 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (password && password.length < 6) {
      setError("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    try {
      const channels = channelsText
        .split(/[\n,]/)
        .map((c) => c.trim())
        .filter(Boolean);

      await updateUser({
        id: user.id,
        data: {
          phone,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          position: position.trim() || undefined,
          bio: bio.trim() || undefined,
          avatarUrl,
          username: username.trim().toLowerCase() || undefined,
          birthYear: birthYear ? Number(birthYear) : undefined,
          channels,
          ...(password ? { password } : {}),
        },
      });

      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlashda xatolik");
    }
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
        <h1 className="flex-1 truncate px-2 text-center text-[17px] font-semibold text-zinc-900 dark:text-white">
          Tahrirlash
        </h1>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isLoading}
          className="rounded-full px-3 py-1.5 text-[15px] font-semibold text-[#00bbff] hover:bg-[#00bbff]/10 disabled:opacity-50"
        >
          {isLoading ? "..." : "Saqlash"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-3 pb-8 pt-6">
        <div className="mb-6 flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative"
            aria-label="Rasm yuklash"
          >
            <ContactAvatar contact={draftContact} />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35">
              <Icon icon={IconCamera} size={28} className="text-white" />
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handlePhoto(e.target.files?.[0])}
            />
          </button>
          <p className="mt-3 text-center text-sm font-medium text-zinc-900 dark:text-white">
            {draftContact.name}
          </p>
          {user.username && (
            <p className="text-sm text-zinc-500">@{user.username}</p>
          )}
        </div>

        <SettingsCard className="mb-3 space-y-4 p-4">
          <Input
            label="Ism"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Familiya"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            label="Telefon"
            value={phoneLocal}
            onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, ""))}
            placeholder="947932005"
          />
          <Input
            label="Lavozim"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <Input
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
          />
          <Input
            label="Tug'ilgan yil"
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="1998"
          />
          <div>
            <label className="mb-1.5 block px-1 text-xs font-medium text-[#00bbff]">
              Kanallar (vergul bilan)
            </label>
            <textarea
              value={channelsText}
              onChange={(e) => setChannelsText(e.target.value)}
              rows={2}
              className={cn(
                "w-full rounded-xl border border-[#00bbff]/80 bg-transparent px-4 py-3 text-sm",
                "text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00bbff]/30",
              )}
            />
          </div>
        </SettingsCard>

        <h3 className="mb-2 px-2 text-sm font-semibold text-[#00bbff]">Parolni yangilash</h3>
        <SettingsCard className="mb-3 p-4">
          <Input
            label="Yangi parol (ixtiyoriy)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin reset"
          />
        </SettingsCard>
        <p className="px-2 text-xs text-zinc-500">
          Bo&apos;sh qoldirsangiz, foydalanuvchi paroli o&apos;zgarmaydi.
        </p>

        {error && (
          <p className="mt-4 px-2 text-center text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
