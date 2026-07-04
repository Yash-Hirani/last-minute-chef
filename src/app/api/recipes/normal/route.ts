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
  description: string
  taste: string
  health_level: string
  cook_speed: string
  difficulty: string
  course: string
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { 
    ingredients, 
    dietary = [], 
    allergies = [], 
    mealType,
    cuisine,
    courseType,
    tasteProfile,
    healthLevel,
    maxTimeMins
  } = body;

  if (!ingredients || ingredients.length === 0) {
    return NextResponse.json({ error: 'At least one ingredient required' }, { status: 400 });
  }

  // Determine dietary filters
  const vegetarian_only = dietary.includes('Vegetarian');
  const vegan_only = dietary.includes('Vegan');
  const halal = dietary.includes('Halal');
  const kosher = dietary.includes('Kosher');
  const dairy_free = dietary.includes('Dairy-Free');
  const gluten_free = dietary.includes('Gluten-Free');
  const nut_free = dietary.includes('Nut-Free');

  // Determine max_time_mins from new filter or legacy mealType
  let max_time_mins = null;
  if (maxTimeMins && maxTimeMins !== "Any") {
    max_time_mins = parseInt(maxTimeMins, 10);
  } else if (mealType === "Breakfast" || mealType === "Snack") {
    max_time_mins = 30;
  } else if (mealType === "Lunch" || mealType === "Dinner") {
    max_time_mins = 60;
  }

  try {
    const payload = {
      ingredients,
      top_n: 10,
      max_missing: 5,
      cuisine_filter: cuisine,
      course_filter: courseType,
      taste_filter: tasteProfile,
      health_level_filter: healthLevel,
      max_time_mins,
      vegetarian_only,
      vegan_only,
      halal,
      kosher,
      nut_free,
      dairy_free,
      gluten_free,
    };
    
    const response = await fetch(RECIPE_ENGINE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) {
      throw new Error(`Engine error: ${response.status}`);
    }

    const data = await response.json();
    let mlRecipes: RecipeResult[] = data.results;

    // Post-filter by legacy allergies if they exist
    if (allergies && allergies.length > 0) {
      const allergyKeywords: Record<string, string[]> = {
        "Gluten": ["wheat", "flour", "atta", "maida", "bread", "pasta", "semolina", "suji", "rava"],
        "Dairy": ["milk", "curd", "yogurt", "paneer", "cheese", "cream", "butter", "ghee", "buttermilk"],
        "Nuts": ["cashew", "almond", "peanut", "pistachio", "walnut", "nut", "pine"],
        "Shellfish": ["prawn", "shrimp", "crab", "squid", "clam", "shellfish"],
        "Soy": ["soy", "tofu"],
      };

      const activeKeywords: string[] = [];
      for (const a of allergies) {
        if (allergyKeywords[a]) activeKeywords.push(...allergyKeywords[a]);
      }

      if (activeKeywords.length > 0) {
        mlRecipes = mlRecipes.filter(r => {
          const allIngs = [...r.available_ingredients, ...r.missing_ingredients].join(" ").toLowerCase();
          return !activeKeywords.some(kw => allIngs.includes(kw));
        });
      }
    }
    
    // Slice to top 4 after filtering
    mlRecipes = mlRecipes.slice(0, 4);

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

      // Calculate estimated Instamart prices for missing ingredients
      const products = searchProducts(r.missing_ingredients);
      const missingCost = products.reduce((sum, p) => sum + p.price, 0);

      // Extract instructions into an array (splitting by simple punctuation or newlines if any)
      const instrStr = r.instructions || "";
      const instructions = instrStr.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim() + ".");

      return {
        id: generateId(),
        name: r.name,
        imageUrl: r.image_url || undefined,
        cuisine: r.cuisine || "Global",
        cookTime: `${r.time_mins} mins`,
        difficulty: r.difficulty ? (r.difficulty.charAt(0).toUpperCase() + r.difficulty.slice(1)) : "Medium",
        servings: 2,
        description: r.description || `A delicious ${r.cuisine} ${r.course} dish.`,
        ingredients: recipeIngredients,
        instructions: instructions,
        nutrition: { calories: 350, protein: "12g", carbs: "45g", fat: "10g" },
        matchPercentage: r.match_pct,
        missingCost,
        taste: r.taste ? r.taste.charAt(0).toUpperCase() + r.taste.slice(1) : undefined,
        healthLevel: r.health_level ? r.health_level.charAt(0).toUpperCase() + r.health_level.slice(1) : undefined,
        cookSpeed: r.cook_speed ? r.cook_speed.charAt(0).toUpperCase() + r.cook_speed.slice(1) : undefined,
        course: r.course || undefined,
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
