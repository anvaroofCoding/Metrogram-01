import {
  useCallback,
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function PinInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  className,
}: PinInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const focusInput = useCallback((index: number) => {
    inputsRef.current[index]?.focus();
  }, []);

  const updateValue = useCallback(
    (next: string) => {
      const sanitized = next.replace(/\D/g, "").slice(0, length);
      onChange(sanitized);
      if (sanitized.length === length) {
        onComplete?.(sanitized);
      }
    },
    [length, onChange, onComplete],
  );

  useEffect(() => {
    focusInput(0);
  }, [focusInput]);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    const chars = digits.map((d) => (d === " " ? "" : d));
    chars[index] = digit;
    updateValue(chars.join(""));
    if (index < length - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const chars = digits.map((d) => (d === " " ? "" : d));
      if (chars[index]) {
        chars[index] = "";
        updateValue(chars.join(""));
      } else if (index > 0) {
        chars[index - 1] = "";
        updateValue(chars.join(""));
        focusInput(index - 1);
      }
    }

    if (e.key === "ArrowLeft" && index > 0) focusInput(index - 1);
    if (e.key === "ArrowRight" && index < length - 1) focusInput(index + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    updateValue(pasted);
    focusInput(Math.min(pasted.length, length - 1));
  };

  return (
    <div className={cn("flex justify-center gap-2 sm:gap-3", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digits[index] === " " ? "" : digits[index]}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-10 sm:h-14 sm:w-12 rounded-xl border bg-transparent text-center text-xl font-medium",
            "border-zinc-300 text-zinc-900 dark:border-zinc-600 dark:text-white",
            "focus:border-[#00bbff] focus:outline-none focus:ring-1 focus:ring-[#00bbff]/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}
