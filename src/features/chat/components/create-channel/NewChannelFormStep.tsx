import { useRef, useState } from "react";
import { Icon, IconAdd, IconCamera, IconChevronBack } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { uploadAvatarImage } from "@/lib/avatar-upload";
import { cn } from "@/lib/utils";

export interface ChannelFormData {
  title: string;
  description: string;
  avatarUrl?: string;
}

interface NewChannelFormStepProps {
  data: ChannelFormData;
  onChange: (data: ChannelFormData) => void;
  onBack: () => void;
  onNext: () => void;
}

export function NewChannelFormStep({ data, onChange, onBack, onNext }: NewChannelFormStepProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const canProceed = data.title.trim().length > 0 && !uploadingPhoto;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setUploadingPhoto(true);
    try {
      const url = await uploadAvatarImage(file);
      onChange({ ...data, avatarUrl: url });
    } catch {
      setPhotoError("Rasm yuklanmadi. Boshqa fayl tanlang.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center px-2 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Orqaga"
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-zinc-900 dark:text-white">
          New Channel
        </h1>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-24">
        <div className="flex justify-center py-6">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPhoto}
            className={cn(
              "relative flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#00bbff] text-white shadow-lg transition hover:bg-[#00a3e0]",
              uploadingPhoto && "cursor-wait opacity-80",
            )}
            aria-label="Rasm yuklash"
          >
            {data.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <Icon icon={IconCamera} size={48} />
            )}
            {uploadingPhoto && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-sm font-medium">
                ...
              </span>
            )}
            <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#00bbff] ring-4 ring-white dark:ring-[#1e1e1e]">
              <Icon icon={IconAdd} size={20} />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handlePhotoChange(e)}
          />
        </div>

        <div className="space-y-4">
          <Input
            label="Channel name"
            placeholder="Channel name"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            autoFocus
          />

          <div className="relative">
            <label
              htmlFor="channel-description"
              className="absolute -top-2.5 left-3 z-10 bg-white px-1 text-xs font-medium text-[#00bbff] dark:bg-[#1e1e1e]"
            >
              Description
            </label>
            <textarea
              id="channel-description"
              rows={3}
              placeholder="Description (optional)"
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              className={cn(
                "w-full resize-none rounded-xl border border-[#00bbff]/80 bg-transparent px-4 py-3.5 text-base",
                "text-zinc-900 dark:text-white",
                "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                "focus:border-[#00bbff] focus:outline-none focus:ring-1 focus:ring-[#00bbff]/30",
              )}
            />
          </div>

          <p className="px-1 text-sm text-zinc-500 dark:text-zinc-400">
            You can provide an optional description for your channel.
          </p>
          {photoError && (
            <p className="px-1 text-center text-sm text-red-500">{photoError}</p>
          )}
        </div>
      </div>

      <div className="absolute bottom-5 right-5">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition",
            canProceed
              ? "bg-[#00bbff] text-white hover:bg-[#00a3e0] hover:scale-105"
              : "cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700",
          )}
          aria-label="Keyingi"
        >
          <Icon icon={IconChevronBack} size={26} className="rotate-180" />
        </button>
      </div>
    </div>
  );
}
