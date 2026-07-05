// ============================================
// localStorage Utilities — Client-side only
// ============================================

import { Recipe } from "./types";
import { supabase } from "./supabase";

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

// ---- Saved Recipes (DB Integration) ----

export async function toggleSaveRecipeDb(userId: string, recipe: Recipe): Promise<boolean> {
  const { data: existing } = await supabase
    .from("saved_recipes")
    .select("recipe_id")
    .eq("user_id", userId)
    .eq("recipe_id", recipe.id)
    .single();

  if (existing) {
    // Unsave
    await supabase.from("saved_recipes").delete().eq("user_id", userId).eq("recipe_id", recipe.id);
    return false;
  } else {
    // Save
    await supabase.from("saved_recipes").insert({
      user_id: userId,
      recipe_id: recipe.id,
      recipe_data: recipe
    });
    return true;
  }
}

export async function getSavedRecipesDb(userId: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("saved_recipes")
    .select("recipe_data")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => row.recipe_data as Recipe);
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
