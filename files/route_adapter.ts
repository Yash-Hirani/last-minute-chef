// src/app/api/recipes/route.ts
// Drop-in replacement for your existing Gemini route.
// Calls the local Python recipe engine instead of any LLM.

import { NextRequest, NextResponse } from 'next/server'

const RECIPE_ENGINE_URL = process.env.RECIPE_ENGINE_URL ?? 'http://localhost:5001/search'

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
  const body = await req.json()
  const { ingredients, dietary_prefs, max_time_mins, vegetarian_only } = body

  if (!ingredients || ingredients.length === 0) {
    return NextResponse.json({ error: 'At least one ingredient required' }, { status: 400 })
  }

  try {
    const response = await fetch(RECIPE_ENGINE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients,
        top_n: 4,
        max_missing: 5,
        max_time_mins: max_time_mins ?? null,
        vegetarian_only: vegetarian_only ?? false,
        // Pass cuisine_filter if user selects one in your UI
        cuisine_filter: dietary_prefs?.cuisine ?? null,
      }),
      signal: AbortSignal.timeout(3000), // 3s timeout — engine responds in <15ms
    })

    if (!response.ok) {
      throw new Error(`Engine error: ${response.status}`)
    }

    const data = await response.json()
    const recipes: RecipeResult[] = data.results

    // Enrich with Instamart product data (your existing logic)
    const enriched = await Promise.all(
      recipes.map(async (recipe) => {
        const missingProducts = await Promise.all(
          recipe.missing_ingredients.map(async (ing) => {
            const product = await searchInstamart(ing) // your existing function
            return { ingredient: ing, product }
          })
        )
        const missingCost = missingProducts.reduce((sum, p) => sum + (p.product?.price ?? 0), 0)
        return { ...recipe, missingProducts, missingCost }
      })
    )

    return NextResponse.json({ recipes: enriched })

  } catch (err) {
    console.error('Recipe engine error:', err)
    // Graceful fallback message — never show a blank screen
    return NextResponse.json(
      { error: 'Recipe service temporarily unavailable. Please try again.' },
      { status: 503 }
    )
  }
}

// ── Stub: replace with your real instamart.ts searchProducts() ──
async function searchInstamart(ingredient: string) {
  // your existing searchProducts(ingredient) call here
  return null
}
