import { Icon, IconDownload } from "@/components/icons";
import { downloadMediaUrl } from "@/lib/files";
import { cn } from "@/lib/utils";

interface MediaHoverActionsProps {
  url: string;
  filename?: string;
  className?: string;
}

export function MediaHoverActions({ url, filename, className }: MediaHoverActionsProps) {
  const handleDownload = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await downloadMediaUrl(url, filename ?? "media");
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-start justify-end p-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleDownload}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70"
        aria-label="Yuklab olish"
      >
        <Icon icon={IconDownload} size={18} />
      </button>
    </div>
  );
}
