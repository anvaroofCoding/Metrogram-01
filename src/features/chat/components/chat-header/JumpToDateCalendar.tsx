import { useMemo, useState } from "react";
import { Icon, IconChevronBack, IconChevronForward, IconClose } from "@/components/icons";
import { cn } from "@/lib/utils";

interface JumpToDateCalendarProps {
  open: boolean;
  onClose: () => void;
  messageDates: string[];
  initialDateKey?: string;
  onJump: (dateKey: string) => void;
}

const WEEKDAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ day: number; dateKey: string } | null> = [];

  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, dateKey });
  }

  return cells;
}

export function JumpToDateCalendar({
  open,
  onClose,
  messageDates,
  initialDateKey,
  onJump,
}: JumpToDateCalendarProps) {
  const today = new Date();
  const initial = initialDateKey ? new Date(initialDateKey) : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [selectedKey, setSelectedKey] = useState<string | null>(
    initialDateKey ?? null,
  );

  const dateSet = useMemo(() => new Set(messageDates), [messageDates]);
  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("uz-UZ", {
    month: "long",
    year: "numeric",
  });

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const handleJump = () => {
    if (!selectedKey || !dateSet.has(selectedKey)) return;
    onJump(selectedKey);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/30"
        aria-label="Yopish"
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(340px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2",
          "overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#212121]",
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Yopish"
          >
            <Icon icon={IconClose} size={22} />
          </button>
          <span className="text-sm font-semibold capitalize text-zinc-900 dark:text-white">
            {monthLabel}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#00bbff] hover:bg-[#00bbff]/10"
              aria-label="Oldingi oy"
            >
              <Icon icon={IconChevronBack} size={18} />
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#00bbff] hover:bg-[#00bbff]/10"
              aria-label="Keyingi oy"
            >
              <Icon icon={IconChevronForward} size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 pb-2 pt-3">
          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day, i) => (
              <span
                key={day}
                className={cn(
                  "text-center text-[11px] font-medium",
                  i >= 5 ? "text-red-400" : "text-zinc-400",
                )}
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} />;

              const hasMessages = dateSet.has(cell.dateKey);
              const isSelected = selectedKey === cell.dateKey;
              const isToday = cell.dateKey === todayKey;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={!hasMessages}
                  onClick={() => setSelectedKey(cell.dateKey)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm transition",
                    !hasMessages && "cursor-default text-zinc-300 dark:text-zinc-600",
                    hasMessages && !isSelected && "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
                    isSelected && "bg-[#00bbff] text-white",
                    isToday && !isSelected && hasMessages && "ring-2 ring-zinc-900 dark:ring-white",
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-4 pt-2">
          <button
            type="button"
            disabled={!selectedKey || !dateSet.has(selectedKey ?? "")}
            onClick={handleJump}
            className={cn(
              "w-full rounded-full py-3 text-sm font-semibold uppercase tracking-wide transition",
              selectedKey && dateSet.has(selectedKey)
                ? "bg-[#00bbff] text-white hover:bg-[#00a3e0]"
                : "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500",
            )}
          >
            Sanaga o&apos;tish
          </button>
        </div>
      </div>
    </>
  );
}
