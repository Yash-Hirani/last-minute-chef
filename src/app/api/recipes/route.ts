// ============================================
// POST /api/recipes — AI Recipe Generation
// ============================================

import { NextRequest } from "next/server";
import { generateRecipesStream } from "@/lib/gemini";
import { searchProducts } from "@/lib/instamart";
import { Recipe, Ingredient } from "@/lib/types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Robustly extract fully formed JSON objects from a JSON string (like an array)
function getCompleteObjects(jsonStr: string): any[] {
  const objects = [];
  let depth = 0;
  let inString = false;
  let escape = false;
  let startIndex = -1;
  
  const arrayStart = jsonStr.indexOf('[');
  if (arrayStart === -1) return [];
  
  for (let i = arrayStart; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    
    if (escape) {
      escape = false;
      continue;
    }
    
    if (char === '\\') {
      escape = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') {
        if (depth === 0) startIndex = i;
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && startIndex !== -1) {
          const objStr = jsonStr.substring(startIndex, i + 1);
          try {
            objects.push(JSON.parse(objStr));
          } catch (e) {
            // Wait for next chunk if parsing fails
          }
          startIndex = -1;
        }
      }
    }
  }
  return objects;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, dietary, allergies, mealType } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one ingredient is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = await generateRecipesStream(
      ingredients,
      dietary || [],
      allergies || [],
      mealType || "Any"
    );

    const encoder = new TextEncoder();
    
    const readable = new ReadableStream({
      async start(controller) {
        let buffer = "";
        let processedCount = 0;
        
        try {
          for await (const chunk of stream) {
            buffer += chunk.text();
            
            const allParsedRecipes = getCompleteObjects(buffer);
            
            // Only process newly found complete recipes
            while (processedCount < allParsedRecipes.length) {
              const recipe = allParsedRecipes[processedCount];
              
              const recipeIngredients: Ingredient[] = recipe.ingredients || [];
              const missingIngredients = recipeIngredients.filter((ing: Ingredient) => !ing.available);
              const availableIngredients = recipeIngredients.filter((ing: Ingredient) => ing.available);

              const missingNames = missingIngredients.map((ing: Ingredient) => ing.name);
              const products = searchProducts(missingNames);
              const missingCost = products.reduce((sum, p) => sum + p.price, 0);

              let matchPercentage = 0;
              if (recipeIngredients.length > 0) {
                matchPercentage = Math.round((availableIngredients.length / recipeIngredients.length) * 100);
              }

              const enrichedRecipe: Recipe = {
                id: generateId(),
                name: recipe.name,
                cuisine: recipe.cuisine,
                cookTime: recipe.cookTime,
                difficulty: recipe.difficulty,
                servings: recipe.servings || 2,
                description: recipe.description || "",
                ingredients: recipeIngredients,
                instructions: recipe.instructions || [],
                nutrition: recipe.nutrition || { calories: 0, protein: "0g", carbs: "0g", fat: "0g" },
                matchPercentage,
                missingCost,
                missingProducts: products,
              };
              
              controller.enqueue(encoder.encode(JSON.stringify(enrichedRecipe) + "\n"));
              processedCount++;
            }
          }
        } catch (error) {
          console.error("Stream processing error:", error);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error) {
    console.error("Recipe generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate recipes. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
