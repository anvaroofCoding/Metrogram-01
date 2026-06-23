import { cn } from "@/lib/utils";

interface SidebarContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarContainer({ children, className }: SidebarContainerProps) {
  return (
    <aside
      className={cn(
        "relative flex h-full w-full shrink-0 flex-col overflow-hidden",
        "rounded-none bg-white shadow-none",
        "md:w-[420px] md:rounded-[28px] md:shadow-xl",
        "dark:bg-[#1e1e1e] dark:md:shadow-black/40",
        className,
      )}
    >
      {children}
    </aside>
  );
}
