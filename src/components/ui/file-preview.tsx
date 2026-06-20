import { Icon, IconClose, IconDocument } from "@/components/icons";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/files";
import type { UploadedFile } from "@/types/attachments";

interface FilePreviewProps {
  files: UploadedFile[];
  onRemove?: (id: string) => void;
  className?: string;
}

function FileTypeIcon({ kind }: { kind: UploadedFile["kind"] }) {
  if (kind === "pdf") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
        <Icon icon={IconDocument} size={20} />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
      <Icon icon={IconDocument} size={20} />
    </div>
  );
}

export function FilePreview({ files, onRemove, className }: FilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 px-3 pt-2", className)}>
      {files.map((file) =>
        file.kind === "image" && file.previewUrl ? (
          <div key={file.id} className="group relative">
            <img
              src={file.previewUrl}
              alt={file.name}
              className="h-16 w-16 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
              loading="lazy"
              decoding="async"
            />
            {onRemove && (
              <RemoveButton onClick={() => onRemove(file.id)} />
            )}
          </div>
        ) : file.kind === "video" && file.previewUrl ? (
          <div key={file.id} className="group relative">
            <video
              src={file.previewUrl}
              className="h-16 w-16 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
              muted
              playsInline
              preload="metadata"
            />
            <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
              VIDEO
            </span>
            {onRemove && (
              <RemoveButton onClick={() => onRemove(file.id)} />
            )}
          </div>
        ) : (
          <div
            key={file.id}
            className="group relative flex min-w-[140px] items-center gap-2.5 rounded-xl bg-zinc-200/80 px-3 py-2 dark:bg-zinc-700/80"
          >
            <FileTypeIcon kind={file.kind} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                {file.name}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                {file.kind === "file" ? formatFileSize(file.file.size) : file.kind}
              </p>
            </div>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                className="rounded-full p-0.5 text-zinc-400 opacity-0 transition-opacity hover:text-zinc-600 group-hover:opacity-100 dark:hover:text-zinc-200"
                aria-label="O'chirish"
              >
                <Icon icon={IconClose} size={14} />
              </button>
            )}
          </div>
        ),
      )}
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-white opacity-0 transition-opacity group-hover:opacity-100"
      aria-label="O'chirish"
    >
      <Icon icon={IconClose} size={12} />
    </button>
  );
}

export type { UploadedFile };
