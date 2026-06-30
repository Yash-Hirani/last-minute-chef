"use client";

import { Filters } from "@/lib/types";

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const CUISINES = ["Any", "American", "Asian", "Indian", "Italian", "French", "Korean", "Thai", "Mediterranean", "Mexican"];
const COURSES = ["Any", "Main", "Breakfast", "Dessert", "Snack", "Soup", "Side", "Appetizer"];
const TASTES = ["Any", "Savory", "Sweet", "Spicy", "Umami", "Sour", "Bitter"];
const HEALTH_LEVELS = ["Any", "Healthy", "Moderate", "Unhealthy"];
const DIETARY = ["Vegetarian", "Vegan", "Halal", "Kosher", "Dairy-Free", "Gluten-Free", "Nut-Free"];

export default function FilterBar({ filters, onFiltersChange, isVisible, onToggle }: Props) {
  const toggleDietary = (val: string) => {
    const arr = filters.dietary;
    onFiltersChange({ ...filters, dietary: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] });
  };

  return (
    <div className="w-full">
      <button onClick={onToggle} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium py-1">
        <svg className={`w-4 h-4 transition-transform ${isVisible ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        {isVisible ? "Hide filters" : "Show filters"}
      </button>

      {isVisible && (
        <div className="mt-3 space-y-5 animate-fade-up p-5 bg-surface-container-low rounded-2xl max-h-[60vh] overflow-y-auto no-scrollbar border border-outline-variant/10 shadow-ambient-1">
          
          {/* Cuisine */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Cuisine</p>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((c) => (
                <button key={c} onClick={() => onFiltersChange({ ...filters, cuisine: c })} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  filters.cuisine === c
                    ? "bg-primary text-on-primary border-primary shadow-sm shadow-primary/15"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-primary/30 hover:bg-primary/5"
                }`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Course */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Course Type</p>
            <div className="flex flex-wrap gap-2">
              {COURSES.map((c) => (
                <button key={c} onClick={() => onFiltersChange({ ...filters, courseType: c })} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  filters.courseType === c
                    ? "bg-primary text-on-primary border-primary shadow-sm shadow-primary/15"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-primary/30 hover:bg-primary/5"
                }`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Taste */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Taste Profile</p>
            <div className="flex flex-wrap gap-2">
              {TASTES.map((t) => (
                <button key={t} onClick={() => onFiltersChange({ ...filters, tasteProfile: t })} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  filters.tasteProfile === t
                    ? "bg-secondary text-on-secondary border-secondary shadow-sm shadow-secondary/15"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-secondary/30 hover:bg-secondary/5"
                }`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Health Level */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Health Level</p>
            <div className="flex flex-wrap gap-2">
              {HEALTH_LEVELS.map((h) => (
                <button key={h} onClick={() => onFiltersChange({ ...filters, healthLevel: h })} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  filters.healthLevel === h
                    ? "bg-tertiary text-on-tertiary border-tertiary shadow-sm shadow-tertiary/15"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-tertiary/30 hover:bg-tertiary/5"
                }`}>{h}</button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions (Multi-select) */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Dietary & Allergies</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY.map((d) => (
                <button key={d} onClick={() => toggleDietary(d)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  filters.dietary.includes(d)
                    ? "bg-error text-on-error border-error shadow-sm shadow-error/15"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-error/30 hover:bg-error/5"
                }`}>{d}</button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
