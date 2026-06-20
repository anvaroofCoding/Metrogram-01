import { useEffect, useRef, useState } from "react";
import { Icon, IconAdd, IconCamera, IconChevronBack } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { useUpdateConversationMutation } from "@/features/chat/api/chatApi";
import { uploadAvatarImage } from "@/lib/avatar-upload";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

interface EditChannelPanelProps {
  conversation: Conversation;
  onBack: () => void;
  onSaved?: (conversation: Conversation) => void;
}

export function EditChannelPanel({ conversation, onBack, onSaved }: EditChannelPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: updateConversation, isLoading: saving } = useUpdateConversationMutation();

  const [title, setTitle] = useState(conversation.title);
  const [description, setDescription] = useState(conversation.description ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(conversation.avatarUrl);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isChannel = conversation.category === "channel";

  useEffect(() => {
    setTitle(conversation.title);
    setDescription(conversation.description ?? "");
    setAvatarUrl(conversation.avatarUrl);
  }, [conversation]);

  const handlePhotoChange = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploadingPhoto(true);
    try {
      setAvatarUrl(await uploadAvatarImage(file));
    } catch {
      setError("Rasm yuklanmadi. Boshqa fayl tanlang.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Kanal nomi majburiy");
      return;
    }

    try {
      const updated = await updateConversation({
        conversationId: conversation.id,
        title: trimmedTitle,
        description: description.trim(),
        avatarUrl,
      });
      onSaved?.(updated);
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlashda xatolik");
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden rounded-[28px] bg-[#f4f4f5] dark:bg-[#1c1c1e]">
      <header className="flex shrink-0 items-center bg-white px-2 py-3 dark:bg-[#2a2a2a]">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Orqaga"
        >
          <Icon icon={IconChevronBack} size={24} />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-zinc-900 dark:text-white">
          {isChannel ? "Edit Channel" : "Edit Group"}
        </h1>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || !title.trim() || uploadingPhoto}
          className="rounded-full px-3 py-1.5 text-[15px] font-semibold text-[#00bbff] hover:bg-[#00bbff]/10 disabled:opacity-50"
        >
          {saving ? "..." : "Done"}
        </button>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-8 pt-6">
        <div className="mb-6 flex justify-center">
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
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <Icon icon={IconCamera} size={48} />
            )}
            {uploadingPhoto && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-sm font-medium">
                ...
              </span>
            )}
            <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#00bbff] ring-4 ring-[#f4f4f5] dark:ring-[#1c1c1e]">
              <Icon icon={IconAdd} size={20} />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handlePhotoChange(e.target.files?.[0])}
          />
        </div>

        <div className="space-y-4">
          <Input
            label={isChannel ? "Channel name" : "Group name"}
            placeholder={isChannel ? "Channel name" : "Group name"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="relative">
            <label
              htmlFor="edit-channel-description"
              className="absolute -top-2.5 left-3 z-10 bg-[#f4f4f5] px-1 text-xs font-medium text-[#00bbff] dark:bg-[#1c1c1e]"
            >
              Description
            </label>
            <textarea
              id="edit-channel-description"
              rows={3}
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(
                "w-full resize-none rounded-xl border border-[#00bbff]/80 bg-transparent px-4 py-3.5 text-base",
                "text-zinc-900 dark:text-white",
                "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                "focus:border-[#00bbff] focus:outline-none focus:ring-1 focus:ring-[#00bbff]/30",
              )}
            />
          </div>
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
