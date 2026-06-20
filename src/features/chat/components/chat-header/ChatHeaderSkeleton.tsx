import { Skeleton } from "@/components/ui/skeleton";

export function ChatHeaderSkeleton() {
  return (
    <div
      className="flex items-center gap-3 border-b border-zinc-200/60 px-4 py-3 dark:border-zinc-800"
      role="status"
      aria-label="Chat sarlavhasi yuklanmoqda"
    >
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
    </div>
  );
}
