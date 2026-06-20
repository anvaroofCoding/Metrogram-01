import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, IconMic } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { MessageAttachment } from "@/types/attachments";

interface VoiceMessageBubbleProps {
  attachment: MessageAttachment;
  variant?: "sent" | "received";
  className?: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceMessageBubble({
  attachment,
  variant = "received",
  className,
}: VoiceMessageBubbleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const duration = attachment.duration ?? 1;
  const bars = attachment.waveform?.length
    ? attachment.waveform
    : Array.from({ length: 28 }, (_, i) => 0.2 + ((i * 7) % 11) / 20);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(attachment.url);
      audioRef.current.onended = () => {
        setPlaying(false);
        setProgress(0);
      };
      audioRef.current.ontimeupdate = () => {
        if (!audioRef.current) return;
        setProgress(audioRef.current.currentTime / (audioRef.current.duration || duration));
      };
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [attachment.url, duration, playing]);

  const playedBars = Math.floor(progress * bars.length);

  return (
    <div
      className={cn(
        "flex w-[min(100%,280px)] items-center gap-2.5 rounded-2xl px-3 py-2.5",
        variant === "sent"
          ? "bg-[#00bbff] text-white"
          : "bg-white text-zinc-900 shadow-sm dark:bg-[#2b2b2b] dark:text-white",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => void togglePlay()}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition",
          variant === "sent"
            ? "bg-white/20 hover:bg-white/30"
            : "bg-[#00bbff] text-white hover:bg-[#00a3e0]",
        )}
        aria-label={playing ? "Pauza" : "Ijro etish"}
      >
        {playing ? (
          <span className="flex gap-0.5">
            <span className="h-4 w-1 rounded-full bg-current" />
            <span className="h-4 w-1 rounded-full bg-current" />
          </span>
        ) : (
          <span
            className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-current"
            aria-hidden
          />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex h-7 items-end gap-[2px]">
          {bars.map((level, i) => (
            <span
              key={i}
              className={cn(
                "w-[3px] rounded-full transition-colors",
                variant === "sent"
                  ? i <= playedBars
                    ? "bg-white"
                    : "bg-white/45"
                  : i <= playedBars
                    ? "bg-[#00bbff]"
                    : "bg-[#00bbff]/35",
              )}
              style={{ height: `${Math.max(4, level * 24)}px` }}
            />
          ))}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className={cn(
              "text-xs font-medium",
              variant === "sent" ? "text-white/90" : "text-zinc-500",
            )}
          >
            {formatDuration(duration)}
          </span>
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              variant === "sent" ? "bg-white/80" : "bg-[#00bbff]",
            )}
          />
        </div>
      </div>

      {variant === "received" && (
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00bbff]/10 text-[#00bbff]"
          aria-label="Transkripsiya"
        >
          <span className="text-xs font-bold">A→</span>
        </button>
      )}
    </div>
  );
}

interface VoiceRecordingBarProps {
  durationLabel: string;
  waveform: number[];
  onCancel: () => void;
  onSend: () => void;
}

export function VoiceRecordingBar({
  durationLabel,
  waveform,
  onCancel,
  onSend,
}: VoiceRecordingBarProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <button
        type="button"
        onClick={onCancel}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
        aria-label="Bekor qilish"
      >
        <Icon icon={IconMic} size={18} className="text-red-500" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex h-7 items-end gap-[2px]">
          {waveform.map((level, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-[#00bbff]"
              style={{ height: `${Math.max(4, level * 24)}px` }}
            />
          ))}
        </div>
        <p className="mt-1 text-xs font-medium text-red-500">{durationLabel}</p>
      </div>

      <button
        type="button"
        onClick={onSend}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00bbff] text-white transition hover:bg-[#00a3e0]"
        aria-label="Yuborish"
      >
        ↑
      </button>
    </div>
  );
}
