import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from "@/lib/instamart";
import { Recipe, Ingredient } from "@/lib/types";

const RECIPE_ENGINE_URL = process.env.RECIPE_ENGINE_URL ?? 'http://localhost:5001/search';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export interface RecipeResult {
  name: string
  cuisine: string
  time_mins: number
  match_pct: number
  total_ingredients: number
  available_ingredients: string[]
  missing_ingredients: string[]
  missing_count: number
  instructions: string
  image_url: string
  source_url: string
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ingredients, dietary, allergies, mealType } = body;

  if (!ingredients || ingredients.length === 0) {
    return NextResponse.json({ error: 'At least one ingredient required' }, { status: 400 });
  }

  // Determine filters based on frontend state
  let vegetarian_only = false;
  if (dietary && dietary.includes('Vegetarian')) {
    vegetarian_only = true;
  }
  
  // cuisine_filter could be inferred from mealType if we wanted, but let's keep it simple
  let cuisine_filter = null;
  
  try {
    const response = await fetch(RECIPE_ENGINE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients,
        top_n: 4,
        max_missing: 5,
        max_time_mins: null,
        vegetarian_only: vegetarian_only,
        cuisine_filter: cuisine_filter,
      }),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) {
      throw new Error(`Engine error: ${response.status}`);
    }

    const data = await response.json();
    const mlRecipes: RecipeResult[] = data.results;

    // Map ML recipes to the standard frontend Recipe interface
    const enrichedRecipes: Recipe[] = mlRecipes.map((r) => {
      // Reconstruct ingredients array
      const recipeIngredients: Ingredient[] = [];
      r.available_ingredients.forEach(name => {
        recipeIngredients.push({ name, quantity: "to taste", available: true });
      });
      r.missing_ingredients.forEach(name => {
        recipeIngredients.push({ name, quantity: "to taste", available: false });
      });

      // Fetch mock Instamart prices for missing ingredients
      const products = searchProducts(r.missing_ingredients);
      const missingCost = products.reduce((sum, p) => sum + p.price, 0);

      // Extract instructions into an array (splitting by simple punctuation or newlines if any)
      const instrStr = r.instructions || "";
      const instructions = instrStr.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim() + ".");

      return {
        id: generateId(),
        name: r.name,
        cuisine: r.cuisine || "Indian",
        cookTime: `${r.time_mins} mins`,
        difficulty: "Medium",
        servings: 2,
        description: `A delicious ${r.cuisine} dish.`,
        ingredients: recipeIngredients,
        instructions: instructions,
        nutrition: { calories: 350, protein: "12g", carbs: "45g", fat: "10g" },
        matchPercentage: r.match_pct,
        missingCost,
        missingProducts: products,
      };
    });

    return NextResponse.json({ recipes: enrichedRecipes });

  } catch (err) {
    console.error('Recipe engine error:', err);
    return NextResponse.json(
      { error: 'Recipe service temporarily unavailable. Please try again.' },
      { status: 503 }
    );
  }
}
