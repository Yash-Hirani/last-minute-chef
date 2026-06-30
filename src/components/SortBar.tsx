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
    <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/20 shadow-sm self-start">
      {modes.map((mode) => {
        const isActive = currentSort === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onSortChange(mode.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-surface-container-highest text-on-surface shadow-sm border border-outline-variant/30"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 border border-transparent"
            }`}
          >
            <span className={isActive ? "opacity-100" : "opacity-70"}>{mode.icon}</span>
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
