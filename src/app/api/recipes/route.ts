// ============================================
// POST /api/recipes — AI Recipe Generation
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { generateRecipes } from "@/lib/gemini";
import { searchProducts } from "@/lib/instamart";
import { Recipe, Ingredient } from "@/lib/types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, dietary, allergies, mealType } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "At least one ingredient is required" },
        { status: 400 }
      );
    }

    // Call Gemini for recipe generation
    const aiResponse = await generateRecipes(
      ingredients,
      dietary || [],
      allergies || [],
      mealType || "Any"
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawRecipes = (aiResponse as any).recipes || [];

    // Enrich recipes with pricing for missing ingredients
    const enrichedRecipes: Recipe[] = rawRecipes.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recipe: any) => {
        const recipeIngredients: Ingredient[] = recipe.ingredients || [];
        const missingIngredients = recipeIngredients.filter(
          (ing: Ingredient) => !ing.available
        );
        const availableIngredients = recipeIngredients.filter(
          (ing: Ingredient) => ing.available
        );

        // Fetch mock Instamart prices for missing ingredients
        const missingNames = missingIngredients.map((ing: Ingredient) => ing.name);
        const products = searchProducts(missingNames);
        const missingCost = products.reduce((sum, p) => sum + p.price, 0);

        const matchPercentage = Math.round(
          (availableIngredients.length / recipeIngredients.length) * 100
        );

        return {
          id: generateId(),
          name: recipe.name,
          cuisine: recipe.cuisine,
          cookTime: recipe.cookTime,
          difficulty: recipe.difficulty,
          servings: recipe.servings || 2,
          description: recipe.description || "",
          ingredients: recipeIngredients,
          instructions: recipe.instructions || [],
          nutrition: recipe.nutrition || {
            calories: 0,
            protein: "0g",
            carbs: "0g",
            fat: "0g",
          },
          matchPercentage,
          missingCost,
          missingProducts: products,
        };
      }
    );

    // Sort by match percentage (highest first)
    enrichedRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return NextResponse.json({ recipes: enrichedRecipes });
  } catch (error) {
    console.error("Recipe generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipes. Please try again." },
      { status: 500 }
    );
  }
}
