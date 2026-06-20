import {
  useCallback,
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import type { Country } from "../data/countries";
import { getLocalDigitCount } from "../data/countries";
import { formatMaskedPhone } from "../lib/phone-mask";

interface PhoneMaskInputProps {
  country: Country;
  value: string;
  onChange: (localDigits: string) => void;
  onEnter?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export function PhoneMaskInput({
  country,
  value,
  onChange,
  onEnter,
  autoFocus,
  className,
}: PhoneMaskInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const display = formatMaskedPhone(country, value);
  const maxDigits = getLocalDigitCount(country);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus, country.id]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onEnter?.();
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        onChange(value.slice(0, -1));
        return;
      }

      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        if (value.length < maxDigits) {
          onChange(value + e.key);
        }
      }
    },
    [maxDigits, onChange, onEnter, value],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, maxDigits);
      onChange(pasted);
    },
    [maxDigits, onChange],
  );

  return (
    <div className={cn("relative", className)}>
      <label className="pointer-events-none absolute -top-2.5 left-3 z-10 bg-white px-1 text-xs font-medium text-[#00bbff] dark:bg-[#212121]">
        Telefon raqami
      </label>

      <div
        className={cn(
          "relative rounded-xl border bg-transparent transition-colors",
          "border-[#00bbff]/80 focus-within:border-[#00bbff] focus-within:ring-1 focus-within:ring-[#00bbff]/30",
        )}
      >
        {/* Ko'rinadigan maska */}
        <div
          aria-hidden
          className="pointer-events-none px-4 py-3.5 font-mono text-base tracking-wide"
        >
          {Array.from(display).map((char, index) => (
            <span
              key={`${char}-${index}`}
              className={cn(
                char === "-"
                  ? "text-zinc-400 dark:text-zinc-500"
                  : "text-zinc-900 dark:text-white",
              )}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Yashirin input — faqat raqam qabul qiladi */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value}
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="absolute inset-0 cursor-text opacity-0"
          aria-label="Telefon raqami"
        />
      </div>
    </div>
  );
}
