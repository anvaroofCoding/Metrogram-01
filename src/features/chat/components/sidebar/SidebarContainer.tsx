import { cn } from "@/lib/utils";

interface SidebarContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarContainer({ children, className }: SidebarContainerProps) {
  return (
    <aside
      className={cn(
        "relative flex h-full w-[420px] shrink-0 flex-col overflow-hidden",
        "rounded-[28px] bg-white shadow-xl",
        "dark:bg-[#1e1e1e] dark:shadow-black/40",
        className,
      )}
    >
      {children}
    </aside>
  );
}
