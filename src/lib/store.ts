// ============================================
// localStorage Utilities — Client-side only
// ============================================

import { Recipe } from "./types";

const KEYS = {
  RECIPES: "lmc_recipes",
  SAVED: "lmc_saved_recipes",
  AUTH: "lmc_authenticated",
  INGREDIENTS_HISTORY: "lmc_ingredients_history",
} as const;

// ---- Recipe Cache ----

export function cacheRecipes(recipes: Recipe[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.RECIPES, JSON.stringify(recipes));
}

export function getCachedRecipes(): Recipe[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(KEYS.RECIPES);
  return data ? JSON.parse(data) : [];
}

export function getCachedRecipeById(id: string): Recipe | null {
  const recipes = getCachedRecipes();
  return recipes.find((r) => r.id === id) || null;
}

// ---- Saved Recipes ----

export function getSavedRecipeIds(): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(KEYS.SAVED);
  return data ? JSON.parse(data) : [];
}

export function toggleSaveRecipe(id: string): boolean {
  const saved = getSavedRecipeIds();
  const index = saved.indexOf(id);
  if (index > -1) {
    saved.splice(index, 1);
  } else {
    saved.push(id);
  }
  localStorage.setItem(KEYS.SAVED, JSON.stringify(saved));
  return index === -1; // returns true if now saved
}

export function isRecipeSaved(id: string): boolean {
  return getSavedRecipeIds().includes(id);
}

// ---- Auth ----

export function setAuthenticated(value: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.AUTH, JSON.stringify(value));
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const data = localStorage.getItem(KEYS.AUTH);
  return data ? JSON.parse(data) : false;
}

// ---- Ingredient History ----

export function saveIngredientsHistory(ingredients: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.INGREDIENTS_HISTORY, JSON.stringify(ingredients));
}

export function getIngredientsHistory(): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(KEYS.INGREDIENTS_HISTORY);
  return data ? JSON.parse(data) : [];
}
