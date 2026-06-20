import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("skeleton-shimmer rounded-md bg-zinc-200/80 dark:bg-zinc-800/80", className)}
      {...props}
    />
  );
}
