"use client";

import { useState } from "react";
import Image from "next/image";
import { Recipe } from "@/lib/types";

interface Props {
  recipe: Recipe;
  onClose: () => void;
  onOrderMissing: (recipe: Recipe) => void;
  hideMissingContext?: boolean;
}

export default function RecipeDetail({ recipe, onClose, onOrderMissing, hideMissingContext }: Props) {
  const [imageError, setImageError] = useState(false);
  const available = recipe.ingredients.filter((i) => i.available);
  const missing = recipe.ingredients.filter((i) => !i.available);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-on-surface/30 backdrop-blur-sm pt-8 pb-8 px-4">
      <div className="w-full max-w-3xl bg-surface-container-lowest rounded-2xl shadow-ambient-3 animate-fade-up overflow-hidden flex flex-col">
        {/* Image Banner */}
        {recipe.imageUrl && !imageError && (
          <div className="relative w-full h-64 bg-surface-container-low shrink-0">
            <Image 
              src={recipe.imageUrl} 
              alt={recipe.name} 
              fill 
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-outline-variant/15 shrink-0">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-on-surface leading-tight mb-2">{recipe.name}</h2>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant flex-wrap">
              <span className="inline-flex items-center gap-1"><span>🍽</span> {recipe.cuisine}</span>
              <span className="inline-flex items-center gap-1"><span>⏱</span> {recipe.cookTime}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                recipe.difficulty === "Easy" ? "bg-secondary/10 text-secondary border-secondary/20"
                : recipe.difficulty === "Hard" ? "bg-error/10 text-error border-error/20"
                : "bg-primary/10 text-primary border-primary/20"
              }`}>{recipe.difficulty}</span>
              <span className="inline-flex items-center gap-1"><span>👥</span> {recipe.servings} servings</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Instructions */}
          <div className="flex-1 p-6 lg:border-r border-outline-variant/15">
            <h3 className="font-[var(--font-display)] text-lg font-semibold text-on-surface mb-4">Instructions</h3>
            <ol className="space-y-4">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center border border-primary/15 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    {i + 1}
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed pt-1.5" style={{ fontFamily: "var(--font-body)", fontWeight: 500, lineHeight: "1.8" }}>{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 p-6 space-y-5">
            {/* Ingredients */}
            <div className="bg-surface-container-low rounded-xl p-4">
              {hideMissingContext ? (
                <>
                  <h4 className="font-[var(--font-display)] text-sm font-bold text-on-surface mb-3 uppercase tracking-wide">Ingredients</h4>
                  <div className="space-y-2">
                    {recipe.ingredients.map((ing, idx) => (
                      <div key={`${ing.name}-${idx}`} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2 text-on-surface"><span className="text-primary">•</span> {ing.name}</span>
                        <span className="text-on-surface-variant text-xs">{ing.quantity}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-[var(--font-display)] text-sm font-bold text-on-surface mb-3 uppercase tracking-wide">Have ({available.length})</h4>
                  <div className="space-y-2 mb-4">
                    {recipe.ingredients.filter((i) => i.available).map((ing, idx) => (
                      <div key={`${ing.name}-${idx}`} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2 text-on-surface"><span className="text-secondary">✓</span> {ing.name}</span>
                        <span className="text-on-surface-variant text-xs">{ing.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {missing.length > 0 && (
                    <>
                      <h4 className="text-xs font-bold text-error uppercase tracking-wide mb-3">Missing ({missing.length})</h4>
                      <div className="space-y-2">
                        {recipe.ingredients.filter((i) => !i.available).map((ing, idx) => (
                          <div key={`${ing.name}-${idx}`} className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-on-surface"><span className="text-error">✕</span> {ing.name}</span>
                            <span className="text-on-surface-variant text-xs">{ing.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Order */}
            {!hideMissingContext && missing.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-on-surface">Total to order</span>
                  <span className="text-xl font-bold text-primary">₹{recipe.missingCost || 0}</span>
                </div>
                <button onClick={() => onOrderMissing(recipe)} className="btn-primary w-full py-3 text-sm">
                  Order using Instamart
                </button>
                <p className="text-center text-xs text-on-surface-variant mt-2">⚡ Delivery in 15-25 minutes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
