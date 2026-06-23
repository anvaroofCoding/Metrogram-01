import { useTranslation } from "react-i18next";
import {
  Icon,
  IconClose,
  IconForward,
  IconPencil,
  IconReply,
} from "@/components/icons";
import { AppleEmojiText } from "@/components/ui/emoji-picker/AppleEmojiText";
import type { ComposerDraft } from "@/features/chat/lib/message-actions";
import { getCurrentUserIdForChat } from "@/features/chat/api/chatApi";

interface ComposerActionBarProps {
  draft: ComposerDraft;
  contactName?: string;
  onClose: () => void;
}

function previewText(draft: ComposerDraft, t: (key: string) => string): string {
  const { message, mode } = draft;
  if (mode === "forward") {
    const prefix =
      message.senderId === getCurrentUserIdForChat() ? `${t("composer.draft.you")} ` : "";
    return `${prefix}${message.content || t("composer.draft.media")}`;
  }
  if (mode === "edit") return message.content;
  return message.content || t("composer.draft.media");
}

export function ComposerActionBar({ draft, contactName, onClose }: ComposerActionBarProps) {
  const { t } = useTranslation();

  const titleKeys = {
    reply: "composer.draft.reply",
    edit: "composer.draft.edit",
    forward: "composer.draft.forward",
  } as const;

  const icons = {
    reply: IconReply,
    edit: IconPencil,
    forward: IconForward,
  } as const;

  return (
    <div className="mb-2 flex items-stretch gap-2 rounded-2xl bg-[#00bbff]/10 px-3 py-2.5 dark:bg-[#00bbff]/15">
      <div className="flex min-w-0 flex-1 items-stretch gap-2.5">
        <Icon icon={icons[draft.mode]} size={20} className="mt-0.5 shrink-0 text-[#00bbff]" />
        <div className="min-w-0 border-l-2 border-[#00bbff] pl-2.5">
          <p className="text-sm font-semibold text-[#00bbff]">
            {draft.mode === "reply" && contactName
              ? t("composer.draft.replyTo", { name: contactName })
              : t(titleKeys[draft.mode])}
          </p>
          <p className="truncate text-sm text-zinc-600 dark:text-zinc-300">
            <AppleEmojiText text={previewText(draft, t)} emojiSize={16} />
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#00bbff] transition hover:bg-[#00bbff]/10"
        aria-label={t("common.cancel")}
      >
        <Icon icon={IconClose} size={20} />
      </button>
    </div>
  );
}
