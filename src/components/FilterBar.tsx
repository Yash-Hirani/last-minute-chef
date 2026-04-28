"use client";

import { DietaryFilter, AllergyFilter, MealType } from "@/lib/types";

const DIETARY_OPTIONS: DietaryFilter[] = ["Vegetarian", "Vegan", "Jain", "Gluten-Free", "Dairy-Free", "High-Protein", "Low-Carb"];
const ALLERGY_OPTIONS: AllergyFilter[] = ["Nuts", "Dairy", "Gluten", "Soy", "Shellfish", "Eggs"];
const MEAL_OPTIONS: MealType[] = ["Any", "Breakfast", "Lunch", "Dinner", "Snack"];

interface Props {
  dietary: string[];
  allergies: string[];
  mealType: string;
  onDietaryChange: (d: string[]) => void;
  onAllergiesChange: (a: string[]) => void;
  onMealTypeChange: (m: string) => void;
  disabled?: boolean;
}

export default function FilterBar({ dietary, allergies, mealType, onDietaryChange, onAllergiesChange, onMealTypeChange, disabled }: Props) {
  const toggleDietary = (f: string) => {
    onDietaryChange(dietary.includes(f) ? dietary.filter((d) => d !== f) : [...dietary, f]);
  };
  const toggleAllergy = (f: string) => {
    onAllergiesChange(allergies.includes(f) ? allergies.filter((a) => a !== f) : [...allergies, f]);
  };

  return (
    <div className={`space-y-5 ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Meal Type */}
      <div>
        <label className="block text-sm font-medium text-muted-light mb-2">Meal Type</label>
        <div className="flex flex-wrap gap-2">
          {MEAL_OPTIONS.map((m) => (
            <button key={m} onClick={() => onMealTypeChange(m)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${mealType === m ? "bg-saffron text-background shadow-lg shadow-saffron/20" : "glass text-muted hover:text-foreground hover:border-saffron/30"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary */}
      <div>
        <label className="block text-sm font-medium text-muted-light mb-2">Dietary Preferences</label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((d) => (
            <button key={d} onClick={() => toggleDietary(d)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${dietary.includes(d) ? "bg-cardamom/20 text-cardamom border border-cardamom/30" : "glass text-muted hover:text-foreground"}`}>
              {dietary.includes(d) && "✓ "}{d}
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <label className="block text-sm font-medium text-muted-light mb-2">
          Allergies <span className="text-chili/60">(hard constraints)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map((a) => (
            <button key={a} onClick={() => toggleAllergy(a)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${allergies.includes(a) ? "bg-chili/20 text-chili border border-chili/30" : "glass text-muted hover:text-foreground"}`}>
              {allergies.includes(a) && "⚠ "}{a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
