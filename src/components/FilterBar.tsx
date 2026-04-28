"use client";

import { Filters } from "@/lib/types";

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const DIETARY = ["Vegetarian", "Vegan", "Eggetarian", "Non-Veg"];
const ALLERGIES = ["Gluten", "Dairy", "Nuts", "Shellfish", "Soy"];
const MEAL_TYPES = ["Any", "Breakfast", "Lunch", "Dinner", "Snack"];

export default function FilterBar({ filters, onFiltersChange, isVisible, onToggle }: Props) {
  const toggle = (key: "dietary" | "allergies", val: string) => {
    const arr = filters[key];
    onFiltersChange({ ...filters, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] });
  };

  return (
    <div className="w-full">
      <button onClick={onToggle} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium py-1">
        <svg className={`w-4 h-4 transition-transform ${isVisible ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        {isVisible ? "Hide filters" : "Show filters"}
      </button>

      {isVisible && (
        <div className="mt-3 space-y-4 animate-fade-up p-5 bg-surface-container-low rounded-2xl">
          {/* Dietary */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Diet</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY.map((d) => (
                <button key={d} onClick={() => toggle("dietary", d)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  filters.dietary.includes(d)
                    ? "bg-secondary text-on-secondary border-secondary shadow-sm shadow-secondary/15"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-secondary/30 hover:bg-secondary/5"
                }`}>{d}</button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Allergies</p>
            <div className="flex flex-wrap gap-2">
              {ALLERGIES.map((a) => (
                <button key={a} onClick={() => toggle("allergies", a)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  filters.allergies.includes(a)
                    ? "bg-error text-on-error border-error shadow-sm shadow-error/15"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-error/30 hover:bg-error/5"
                }`}>{a}</button>
              ))}
            </div>
          </div>

          {/* Meal Type */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Meal type</p>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((m) => (
                <button key={m} onClick={() => onFiltersChange({ ...filters, mealType: m })} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  filters.mealType === m
                    ? "bg-primary text-on-primary border-primary shadow-sm shadow-primary/15"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-primary/30 hover:bg-primary/5"
                }`}>{m}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
