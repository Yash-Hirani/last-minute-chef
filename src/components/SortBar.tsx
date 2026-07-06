"use client";

import { SortMode } from "@/lib/types";

interface Props {
  currentSort: SortMode;
  onSortChange: (mode: SortMode) => void;
}

export default function SortBar({ currentSort, onSortChange }: Props) {
  const modes: { id: SortMode; label: string; icon: string }[] = [
    { id: "match", label: "Best Match", icon: "📊" },
    { id: "cost", label: "Cheapest First", icon: "₹" },
    { id: "missing", label: "Fewest Missing", icon: "✓" },
  ];

  return (
    <div className="flex items-center gap-2 self-start">
      <span className="text-sm font-medium text-on-surface-variant">Sort:</span>
      <div className="relative">
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortMode)}
          className="bg-surface-container-low text-on-surface text-sm font-medium rounded-lg pl-3 pr-8 py-2 border border-outline-variant/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer shadow-sm appearance-none"
        >
          {modes.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );
}
