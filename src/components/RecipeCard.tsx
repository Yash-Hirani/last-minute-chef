"use client";

import { Recipe } from "@/lib/types";

interface Props {
  recipe: Recipe;
  index: number;
  onViewRecipe: (recipe: Recipe) => void;
  onOrderMissing: (recipe: Recipe) => void;
  onSave: (recipe: Recipe) => void;
  isSaved: boolean;
}

export default function RecipeCard({ recipe, index, onViewRecipe, onOrderMissing, onSave, isSaved }: Props) {
  const available = recipe.ingredients.filter((i) => i.available);
  const missing = recipe.ingredients.filter((i) => !i.available);

  const difficultyColor = {
    Easy: "text-cardamom bg-cardamom/10 border-cardamom/20",
    Medium: "text-saffron bg-saffron/10 border-saffron/20",
    Hard: "text-chili bg-chili/10 border-chili/20",
  }[recipe.difficulty];

  return (
    <div className={`animate-fade-up delay-${index + 1} glass rounded-2xl p-5 hover:bg-card-hover transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-saffron/5 group`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold font-[var(--font-display)] text-foreground group-hover:text-saffron-light transition-colors">{recipe.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted">{recipe.cuisine}</span>
            <span className="text-muted/30">•</span>
            <span className="text-xs text-muted">{recipe.cookTime}</span>
            <span className="text-muted/30">•</span>
            <span className={`text-xs px-2 py-0.5 rounded-lg border ${difficultyColor}`}>{recipe.difficulty}</span>
          </div>
        </div>
        <button onClick={() => onSave(recipe)} className={`p-2 rounded-xl transition-all ${isSaved ? "text-chili" : "text-muted hover:text-chili/70"}`} title={isSaved ? "Unsave" : "Save recipe"}>
          <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-muted mb-4 line-clamp-2">{recipe.description}</p>

      {/* Match bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted">Ingredient match</span>
          <span className="font-semibold text-cardamom">{recipe.matchPercentage}%</span>
        </div>
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cardamom to-cardamom-dark rounded-full transition-all duration-700" style={{ width: `${recipe.matchPercentage}%` }} />
        </div>
      </div>

      {/* Ingredients summary */}
      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {available.slice(0, 5).map((ing) => (
            <span key={ing.name} className="text-xs px-2 py-1 rounded-lg bg-cardamom/10 text-cardamom border border-cardamom/15">✓ {ing.name}</span>
          ))}
          {available.length > 5 && <span className="text-xs px-2 py-1 rounded-lg bg-cardamom/10 text-cardamom">+{available.length - 5} more</span>}
        </div>
        {missing.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {missing.map((ing) => (
              <span key={ing.name} className="text-xs px-2 py-1 rounded-lg bg-chili/10 text-chili/80 border border-chili/15">✗ {ing.name}</span>
            ))}
          </div>
        )}
      </div>

      {/* Cost gap */}
      {missing.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface/50 mb-4">
          <span className="text-xs text-muted">Missing {missing.length} item{missing.length > 1 ? "s" : ""}</span>
          <span className="text-sm font-bold text-saffron">₹{recipe.missingCost}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => onViewRecipe(recipe)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium glass text-foreground hover:bg-surface-light transition-all">
          View Recipe
        </button>
        {missing.length > 0 && (
          <button onClick={() => onOrderMissing(recipe)} className="flex-1 btn-glow px-4 py-2.5 rounded-xl text-sm">
            Order ₹{recipe.missingCost}
          </button>
        )}
      </div>
    </div>
  );
}
