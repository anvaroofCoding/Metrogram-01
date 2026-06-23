import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconChevronDown, IconSearch } from "@/components/icons";
import { cn } from "@/lib/utils";
import { COUNTRIES, type Country } from "../data/countries";

interface CountrySelectProps {
  value: Country;
  onChange: (country: Country) => void;
  className?: string;
}

export function CountrySelect({ value, onChange, className }: CountrySelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        `+${c.dialCode}`.includes(q),
    );
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-transparent px-4 py-3.5 text-left text-base transition-colors",
          "border-[#00bbff]/80 text-zinc-900 dark:text-white",
          "focus:border-[#00bbff] focus:outline-none focus:ring-1 focus:ring-[#00bbff]/30",
          open && "border-[#00bbff] ring-1 ring-[#00bbff]/30",
        )}
      >
        <span className="truncate">{value.name}</span>
        <Icon
          icon={IconChevronDown}
          size={20}
          className={cn(
            "shrink-0 text-zinc-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <label className="pointer-events-none absolute -top-2.5 left-3 z-10 bg-white px-1 text-xs font-medium text-[#00bbff] dark:bg-[#212121]">
        Mamlakat
      </label>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border shadow-xl",
            "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-[#2b2b2b]",
          )}
        >
          <div className="border-b border-zinc-100 p-2 dark:border-zinc-700">
            <div className="relative">
              <Icon
                icon={IconSearch}
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("auth.countrySearch")}
                className="w-full rounded-lg bg-zinc-100 py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none dark:bg-zinc-800 dark:text-white"
                autoFocus
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.map((country) => (
              <li key={country.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(country);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-700/60",
                    value.id === country.id && "bg-[#00bbff]/10",
                  )}
                >
                  <span className="text-xl leading-none">{country.flag}</span>
                  <span className="flex-1 truncate text-sm text-zinc-900 dark:text-white">
                    {country.name}
                  </span>
                  <span className="text-sm text-zinc-400">+{country.dialCode}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-zinc-400">
                {t("common.noResults")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
