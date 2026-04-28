"use client";

import { Recipe } from "@/lib/types";

interface Props {
  recipe: Recipe;
  onViewRecipe: (recipe: Recipe) => void;
  onOrder: (recipe: Recipe) => void;
  onSave: (recipe: Recipe) => void;
  isSaved: boolean;
  index: number;
}

export default function RecipeCard({ recipe, onViewRecipe, onOrder, onSave, isSaved, index }: Props) {
  const totalIngredients = recipe.ingredients.length;
  const availableCount = recipe.ingredients.filter((i) => i.available).length;
  const matchPercent = Math.round((availableCount / totalIngredients) * 100);
  const missingItems = recipe.ingredients.filter((i) => !i.available);

  const difficultyColor: Record<string, string> = {
    Easy: "bg-secondary/10 text-secondary border-secondary/20",
    Medium: "bg-primary/10 text-primary border-primary/20",
    Hard: "bg-error/10 text-error border-error/20",
  };

  return (
    <div className={`card p-0 overflow-hidden animate-fade-up delay-${index + 1}`}>
      {/* Card header */}
      <div className="p-5 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 mr-3">
            <h3 className="font-[var(--font-display)] text-lg font-semibold text-on-surface leading-tight mb-1.5">{recipe.name}</h3>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span>{recipe.cuisine}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span>{recipe.cookTime}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${difficultyColor[recipe.difficulty] || "bg-surface-container text-on-surface-variant border-outline-variant/20"}`}>
                {recipe.difficulty}
              </span>
            </div>
          </div>
          <button onClick={() => onSave(recipe)} className={`p-2 rounded-full transition-all ${isSaved ? "text-primary bg-primary/10" : "text-outline hover:text-primary hover:bg-primary/5"}`} title={isSaved ? "Unsave" : "Save"}>
            <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        </div>

        <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{recipe.description}</p>

        {/* Match bar */}
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-on-surface-variant font-medium">Ingredient match</span>
          <span className={`font-bold ${matchPercent >= 70 ? "text-secondary" : matchPercent >= 50 ? "text-primary" : "text-error"}`}>{matchPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all duration-700 ${matchPercent >= 70 ? "bg-secondary" : matchPercent >= 50 ? "bg-primary" : "bg-error"}`} style={{ width: `${matchPercent}%` }} />
        </div>

        {/* Ingredient pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {recipe.ingredients.filter((i) => i.available).slice(0, 5).map((ing) => (
            <span key={ing.name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/8 text-secondary border border-secondary/15">
              <span className="text-secondary">✓</span> {ing.name}
            </span>
          ))}
          {availableCount > 5 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">+{availableCount - 5} more</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {missingItems.slice(0, 3).map((ing) => (
            <span key={ing.name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-error/8 text-error border border-error/15">
              <span>✕</span> {ing.name}
            </span>
          ))}
          {missingItems.length > 3 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">+{missingItems.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="px-5 py-4 border-t border-outline-variant/15 bg-surface-container-low/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span>Missing {missingItems.length} item{missingItems.length !== 1 ? "s" : ""}</span>
          {recipe.estimatedCost && (
            <span className="font-bold text-primary text-sm">₹{recipe.estimatedCost}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => onViewRecipe(recipe)} className="btn-ghost px-4 py-2 text-sm">View Recipe</button>
          <button onClick={() => onOrder(recipe)} className="btn-primary px-4 py-2 text-sm">
            Order {recipe.estimatedCost ? `₹${recipe.estimatedCost}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
