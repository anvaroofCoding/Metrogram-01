import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={inputId}
            className="absolute -top-2.5 left-3 z-10 bg-white px-1 text-xs font-medium text-[#00bbff] dark:bg-[#212121]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-[#00bbff]/80 bg-transparent px-4 py-3.5 text-base",
            "text-zinc-900 dark:text-white",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
            "focus:border-[#00bbff] focus:outline-none focus:ring-1 focus:ring-[#00bbff]/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";
