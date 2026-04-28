// ============================================
// /api/products — Mock Instamart Product Search
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/instamart";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "At least one ingredient name is required" },
        { status: 400 }
      );
    }

    const products = searchProducts(ingredients);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Product search error:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
