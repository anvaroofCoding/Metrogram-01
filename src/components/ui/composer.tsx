import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type KeyboardEvent,
} from "react";
import { Icon, IconAdd, IconArrowUp, IconEmoji, IconMic } from "@/components/icons";
import { EmojiStickerPicker } from "@/components/ui/emoji-picker/EmojiStickerPicker";
import { AppleEmojiText } from "@/components/ui/emoji-picker/AppleEmojiText";
import { cn } from "@/lib/utils";
import { createUploadedFile, revokeUploadedFiles } from "@/lib/files";
import { FilePreview, type UploadedFile } from "@/components/ui/file-preview";
import { VoiceRecordingBar } from "@/components/ui/voice-message/VoiceMessageBubble";
import { useVoiceRecorder, type VoiceRecordingResult } from "@/hooks/useVoiceRecorder";

export type { UploadedFile };

const PRIMARY_COLOR = "#00bbff";

function removeLastGrapheme(value: string): string {
  if (!value) return value;
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segments = [...new Intl.Segmenter().segment(value)].map((s) => s.segment);
    return segments.slice(0, -1).join("");
  }
  return [...value].slice(0, -1).join("");
}

export interface ComposerProps {
  placeholder?: string;
  onSubmit?: (message: string, files?: UploadedFile[]) => void | Promise<void>;
  onVoiceSubmit?: (voice: VoiceRecordingResult) => void;
  onChange?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  maxRows?: number;
  value?: string;
  className?: string;
  isLoading?: boolean;
}

export const Composer: FC<ComposerProps> = ({
  placeholder = "Xabar yozing...",
  onSubmit,
  onVoiceSubmit,
  onChange,
  disabled = false,
  autoFocus = false,
  maxRows = 8,
  value,
  className,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentValue = value ?? inputValue;

  const voice = useVoiceRecorder();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (value === undefined) setInputValue(newValue);
      onChange?.(newValue);
    },
    [onChange, value],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const lineHeight = 24;
    const maxHeight = lineHeight * maxRows;
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    textarea.style.overflowX = "hidden";
  }, [currentValue, maxRows, attachedFiles.length, voice.isRecording]);

  const clearComposer = useCallback(() => {
    if (value === undefined) setInputValue("");
    revokeUploadedFiles(attachedFiles);
    setAttachedFiles([]);
  }, [attachedFiles, value]);

  const handleSubmit = useCallback(async () => {
    if (isLoading || voice.isRecording) return;
    if (!currentValue.trim() && attachedFiles.length === 0) return;
    try {
      await onSubmit?.(
        currentValue,
        attachedFiles.length > 0 ? attachedFiles : undefined,
      );
      clearComposer();
      setEmojiOpen(false);
    } catch {
      // Xato bo'lsa fayllar saqlanib qoladi — qayta urinish mumkin
    }
  }, [attachedFiles, clearComposer, currentValue, isLoading, onSubmit, voice.isRecording]);

  const handleVoiceSend = useCallback(async () => {
    const result = await voice.stopRecording();
    if (result && onVoiceSubmit) {
      onVoiceSubmit(result);
    }
  }, [onVoiceSubmit, voice]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !disabled && !isLoading && !voice.isRecording) {
        e.preventDefault();
        void handleSubmit();
      }
      if (e.key === "Escape") {
        setEmojiOpen(false);
        if (voice.isRecording) voice.cancelRecording();
      }
    },
    [disabled, handleSubmit, isLoading, voice],
  );

  useEffect(() => {
    if (autoFocus && !voice.isRecording) textareaRef.current?.focus();
  }, [autoFocus, voice.isRecording]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    setAttachedFiles((prev) => [...prev, ...picked.map(createUploadedFile)]);
    e.target.value = "";
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const insertEmoji = useCallback(
    (emoji: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        const next = `${currentValue}${emoji}`;
        if (value === undefined) setInputValue(next);
        onChange?.(next);
        return;
      }

      const start = textarea.selectionStart ?? currentValue.length;
      const end = textarea.selectionEnd ?? currentValue.length;
      const next = `${currentValue.slice(0, start)}${emoji}${currentValue.slice(end)}`;
      if (value === undefined) setInputValue(next);
      onChange?.(next);

      requestAnimationFrame(() => {
        textarea.focus();
        const pos = start + emoji.length;
        textarea.setSelectionRange(pos, pos);
      });
    },
    [currentValue, onChange, value],
  );

  const deleteLastChar = useCallback(() => {
    const textarea = textareaRef.current;
    const end = textarea?.selectionEnd ?? currentValue.length;
    const start = textarea?.selectionStart ?? currentValue.length;
    if (start !== end) {
      const next = `${currentValue.slice(0, start)}${currentValue.slice(end)}`;
      if (value === undefined) setInputValue(next);
      onChange?.(next);
      return;
    }
    if (!currentValue) return;
    const next = removeLastGrapheme(currentValue);
    if (value === undefined) setInputValue(next);
    onChange?.(next);
  }, [currentValue, onChange, value]);

  const canSubmit = Boolean(currentValue.trim()) || attachedFiles.length > 0;
  const showMic = !canSubmit && !voice.isRecording;

  const handleMicClick = useCallback(async () => {
    if (voice.isRecording) {
      await handleVoiceSend();
      return;
    }
    setEmojiOpen(false);
    await voice.startRecording();
  }, [handleVoiceSend, voice]);

  return (
    <div className={cn("relative min-w-0 w-full max-w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.json,application/json"
        className="hidden"
        onChange={handleFilePick}
      />

      <EmojiStickerPicker
        open={emojiOpen && !voice.isRecording}
        onClose={() => setEmojiOpen(false)}
        onSelect={insertEmoji}
        onDelete={deleteLastChar}
        className="absolute bottom-[calc(100%+10px)] left-0 right-0 z-50"
      />

      <div
        className={cn(
          "max-w-full rounded-[28px] px-1 pt-1 pb-2",
          "border border-zinc-200/90 bg-zinc-100 shadow-sm",
          "dark:border-zinc-700 dark:bg-zinc-800",
        )}
      >
        <FilePreview files={attachedFiles} onRemove={handleRemoveFile} />

        {voice.isRecording ? (
          <VoiceRecordingBar
            durationLabel={voice.durationLabel}
            waveform={voice.waveform}
            onCancel={voice.cancelRecording}
            onSend={() => void handleVoiceSend()}
          />
        ) : (
          <>
            <div className="relative min-w-0 overflow-hidden px-3">
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-x-3 top-0 py-3 pr-3",
                  "text-base font-light whitespace-pre-wrap break-words",
                  "text-zinc-900 dark:text-white",
                )}
              >
                <AppleEmojiText text={currentValue} emojiSize={20} />
              </div>
              <textarea
                ref={textareaRef}
                value={currentValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  attachedFiles.length > 0 ? "Ask about these files..." : placeholder
                }
                disabled={disabled || isLoading}
                rows={1}
                className={cn(
                  "relative z-[1] box-border block w-full max-w-full resize-none overflow-x-hidden overflow-y-hidden bg-transparent py-3 pr-3 text-base font-light transition-all",
                  "whitespace-pre-wrap break-words text-transparent caret-zinc-900 dark:caret-white",
                  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                  "focus:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
                style={{ minHeight: "24px", maxHeight: `${24 * maxRows}px` }}
              />
            </div>

            <div className="flex items-center justify-between px-2 pb-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isLoading}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full cursor-pointer",
                    "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400",
                    "hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  aria-label="Fayl biriktirish"
                >
                  <Icon icon={IconAdd} size={22} />
                </button>

                <button
                  type="button"
                  onClick={() => setEmojiOpen((v) => !v)}
                  disabled={disabled || isLoading}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full cursor-pointer transition-colors",
                    "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400",
                    "hover:bg-zinc-300 dark:hover:bg-zinc-600",
                    emojiOpen && "bg-[#00bbff]/20 text-[#00bbff]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  aria-label="Emoji va stikerlar"
                >
                  <Icon icon={IconEmoji} size={22} />
                </button>
              </div>

              {showMic ? (
                <button
                  type="button"
                  onClick={() => void handleMicClick()}
                  disabled={disabled || isLoading}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer",
                    "bg-[#00bbff] text-white hover:bg-[#00a3e0]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  aria-label="Ovozli xabar"
                >
                  <Icon icon={IconMic} size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={disabled || isLoading || !canSubmit}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer",
                    "disabled:cursor-not-allowed",
                    canSubmit && "bg-[#00bbff] text-white hover:bg-[#00a3e0]",
                    !canSubmit && "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500",
                  )}
                  aria-label="Yuborish"
                >
                  <Icon icon={IconArrowUp} size={20} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Composer;
export { PRIMARY_COLOR };
