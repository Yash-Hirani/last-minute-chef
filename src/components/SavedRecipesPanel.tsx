"use client";

import { Recipe } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  savedRecipes: Recipe[];
  onRemove: (recipe: Recipe) => void;
  onViewRecipe: (recipe: Recipe) => void;
  loading: boolean;
}

export default function SavedRecipesPanel({ isOpen, onClose, savedRecipes, onRemove, onViewRecipe, loading }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-on-surface/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-surface-container-lowest h-full shadow-ambient-3 slide-in-right flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/15">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔖</span>
            <h3 className="font-[var(--font-display)] text-lg font-bold text-on-surface">Saved Recipes</h3>
            {!loading && savedRecipes.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/15">{savedRecipes.length} item{savedRecipes.length > 1 ? "s" : ""}</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="spinner w-8 h-8 mb-4 text-primary" />
              <p className="text-on-surface-variant text-sm">Loading saved recipes...</p>
            </div>
          ) : savedRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4 animate-float">🔖</div>
              <p className="text-on-surface-variant text-sm">No saved recipes yet</p>
              <p className="text-on-surface-variant/60 text-xs mt-1">Cook what you have, save your favorites</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedRecipes.map((recipe) => (
                <div key={recipe.id} className="flex flex-col p-4 rounded-xl bg-surface-container-low gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold text-on-surface">{recipe.name}</p>
                      <p className="text-xs text-on-surface-variant">{recipe.cuisine} · {recipe.cookTime}</p>
                    </div>
                    <button onClick={() => onRemove(recipe)} className="p-1.5 rounded-lg hover:bg-error/8 text-outline hover:text-error transition-colors" title="Remove from saved">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                     <span className={`text-xs font-bold ${recipe.matchPercentage >= 70 ? "text-secondary" : recipe.matchPercentage >= 50 ? "text-primary" : "text-error"}`}>{recipe.matchPercentage}% match</span>
                     <button onClick={() => { onViewRecipe(recipe); onClose(); }} className="text-sm font-semibold text-primary hover:text-primary-dark">View Recipe →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
