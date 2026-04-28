"use client";

import { Recipe } from "@/lib/types";

interface Props {
  recipe: Recipe;
  onBack: () => void;
  onOrderMissing: (recipe: Recipe) => void;
  onSave: (recipe: Recipe) => void;
  isSaved: boolean;
}

export default function RecipeDetail({ recipe, onBack, onOrderMissing, onSave, isSaved }: Props) {
  const available = recipe.ingredients.filter((i) => i.available);
  const missing = recipe.ingredients.filter((i) => !i.available);

  return (
    <div className="animate-fade-up">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to recipes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] text-foreground">{recipe.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-sm text-muted">{recipe.cuisine}</span>
                  <span className="text-muted/30">•</span>
                  <span className="text-sm text-muted flex items-center gap-1">⏱ {recipe.cookTime}</span>
                  <span className="text-muted/30">•</span>
                  <span className="text-sm text-muted">🍽 {recipe.servings} servings</span>
                </div>
              </div>
              <button onClick={() => onSave(recipe)} className={`p-2.5 rounded-xl transition-all ${isSaved ? "text-chili bg-chili/10" : "text-muted hover:text-chili glass"}`}>
                <svg className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
            <p className="text-muted">{recipe.description}</p>
          </div>

          {/* Instructions */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold font-[var(--font-display)] mb-4">Step-by-Step Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-saffron/15 text-saffron flex items-center justify-center text-sm font-bold">{i + 1}</div>
                  <p className="text-sm text-muted-light pt-1.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ingredients */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold font-[var(--font-display)] mb-4">Ingredients</h2>
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-cardamom uppercase tracking-wider">You have ({available.length})</p>
              {available.map((ing) => (
                <div key={ing.name} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="flex items-center gap-2 text-foreground"><span className="text-cardamom">✓</span>{ing.name}</span>
                  <span className="text-muted text-xs">{ing.quantity}</span>
                </div>
              ))}
            </div>
            {missing.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-card-border">
                <p className="text-xs font-medium text-chili uppercase tracking-wider">Missing ({missing.length})</p>
                {missing.map((ing) => (
                  <div key={ing.name} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="flex items-center gap-2 text-muted"><span className="text-chili">✗</span>{ing.name}</span>
                    <span className="text-muted text-xs">{ing.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nutrition */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold font-[var(--font-display)] mb-4">Nutrition (per serving)</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Calories", value: `${recipe.nutrition.calories}`, icon: "🔥" },
                { label: "Protein", value: recipe.nutrition.protein, icon: "💪" },
                { label: "Carbs", value: recipe.nutrition.carbs, icon: "🌾" },
                { label: "Fat", value: recipe.nutrition.fat, icon: "🥑" },
              ].map((n) => (
                <div key={n.label} className="p-3 rounded-xl bg-surface/50 text-center">
                  <span className="text-lg">{n.icon}</span>
                  <p className="text-sm font-semibold text-foreground mt-1">{n.value}</p>
                  <p className="text-xs text-muted">{n.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order CTA */}
          {missing.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted">Total to order</span>
                <span className="text-xl font-bold text-saffron">₹{recipe.missingCost}</span>
              </div>
              <button onClick={() => onOrderMissing(recipe)} className="w-full btn-glow py-3 rounded-xl text-sm font-semibold">
                Order {missing.length} Missing Items
              </button>
              <p className="text-xs text-center text-muted mt-2">⚡ Delivery in 15-25 minutes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
