// ============================================
// /api/cart — Mock Instamart Cart Operations
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { addToCart, getCart, clearCart, checkout } from "@/lib/instamart";
import { Product } from "@/lib/types";

// GET — Retrieve current cart
export async function GET() {
  const cart = getCart();
  return NextResponse.json(cart);
}

// POST — Add items or checkout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, products } = body;

    if (action === "checkout") {
      const order = checkout();
      return NextResponse.json(order);
    }

    if (action === "add") {
      if (!products || !Array.isArray(products)) {
        return NextResponse.json(
          { error: "Products array required for add action" },
          { status: 400 }
        );
      }
      const cart = addToCart(products as Product[]);
      return NextResponse.json(cart);
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'add' or 'checkout'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Cart error:", error);
    return NextResponse.json(
      { error: "Cart operation failed" },
      { status: 500 }
    );
  }
}

// DELETE — Clear cart
export async function DELETE() {
  const cart = clearCart();
  return NextResponse.json(cart);
}
