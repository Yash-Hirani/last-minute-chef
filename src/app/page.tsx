"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import IngredientInput from "@/components/IngredientInput";
import FilterBar from "@/components/FilterBar";
import RecipeCard from "@/components/RecipeCard";
import RecipeDetail from "@/components/RecipeDetail";
import ShimmerLoader from "@/components/ShimmerLoader";
import AuthModal from "@/components/AuthModal";
import CartSidebar from "@/components/CartSidebar";
import { Recipe, CartItem } from "@/lib/types";
import {
  cacheRecipes,
  getCachedRecipes,
  toggleSaveRecipe,
  isRecipeSaved,
  getSavedRecipeIds,
  isAuthenticated,
  setAuthenticated,
} from "@/lib/store";

export default function Home() {
  // Input state
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [mealType, setMealType] = useState("Any");

  // Recipe state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // UI state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [authed, setAuthed] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: "order" | "save"; recipe: Recipe } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load persisted state
  useEffect(() => {
    const cached = getCachedRecipes();
    if (cached.length > 0) setRecipes(cached);
    setSavedIds(getSavedRecipeIds());
    setAuthed(isAuthenticated());
  }, []);

  // Fetch recipes
  const findRecipes = useCallback(async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError("");
    setSelectedRecipe(null);

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, dietary, allergies, mealType }),
      });

      if (!res.ok) throw new Error("Failed to generate recipes");
      const data = await res.json();
      setRecipes(data.recipes || []);
      cacheRecipes(data.recipes || []);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [ingredients, dietary, allergies, mealType]);

  // Auth-gated actions
  const handleSave = (recipe: Recipe) => {
    if (!authed) {
      setPendingAction({ type: "save", recipe });
      setShowAuthModal(true);
      return;
    }
    toggleSaveRecipe(recipe.id);
    setSavedIds(getSavedRecipeIds());
  };

  const handleOrderMissing = (recipe: Recipe) => {
    if (!authed) {
      setPendingAction({ type: "order", recipe });
      setShowAuthModal(true);
      return;
    }
    // Add missing ingredients to cart
    const missing = recipe.ingredients.filter((i) => !i.available);
    const newItems: CartItem[] = missing.map((ing) => ({
      product: {
        id: Math.random().toString(36).substring(2, 10),
        name: ing.name.charAt(0).toUpperCase() + ing.name.slice(1),
        brand: "Instamart",
        price: Math.round(20 + Math.random() * 60),
        unit: ing.quantity,
        imageUrl: "",
        ingredientMatch: ing.name,
      },
      quantity: 1,
    }));

    // Fetch real mock prices
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: missing.map((i) => i.name) }),
    })
      .then((r) => r.json())
      .then((data) => {
        const items: CartItem[] = (data.products || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p: any) => ({ product: p, quantity: 1 })
        );
        setCartItems((prev) => {
          const combined = [...prev];
          for (const item of items) {
            const existing = combined.find((c) => c.product.name === item.product.name);
            if (!existing) combined.push(item);
          }
          return combined;
        });
        setShowCart(true);
      })
      .catch(() => {
        // Fallback to basic items
        setCartItems((prev) => [...prev, ...newItems]);
        setShowCart(true);
      });
  };

  const handleAuthenticated = () => {
    setAuthenticated(true);
    setAuthed(true);
    setShowAuthModal(false);
    // Execute pending action
    if (pendingAction) {
      if (pendingAction.type === "save") handleSave(pendingAction.recipe);
      else if (pendingAction.type === "order") handleOrderMissing(pendingAction.recipe);
      setPendingAction(null);
    }
  };

  const handleCheckout = async () => {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout" }),
      });
      setCartItems([]);
    } catch {
      // Silent fail for prototype
    }
  };

  const cartSubtotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? 25 : 0;

  // Recipe detail view
  if (selectedRecipe) {
    return (
      <>
        <Header savedCount={savedIds.length} cartCount={cartItems.length} onCartClick={() => setShowCart(true)} />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
            onOrderMissing={handleOrderMissing}
            onSave={handleSave}
            isSaved={isRecipeSaved(selectedRecipe.id)}
          />
        </main>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthenticated={handleAuthenticated} />
        <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} items={cartItems} subtotal={cartSubtotal} deliveryFee={deliveryFee} total={cartSubtotal + deliveryFee} onCheckout={handleCheckout} />
      </>
    );
  }

  return (
    <>
      <Header savedCount={savedIds.length} cartCount={cartItems.length} onCartClick={() => setShowCart(true)} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Hero */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-saffron mb-4">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75 animate-ping"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-saffron"></span></span>
            Powered by AI · Prices from Instamart
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-[var(--font-display)] mb-3">
            <span className="text-foreground">Cook what you have.</span><br />
            <span className="bg-gradient-to-r from-saffron via-turmeric to-saffron-dark bg-clip-text text-transparent">Order what you don&apos;t.</span>
          </h1>
          <p className="text-muted max-w-lg mx-auto text-sm sm:text-base">Enter your ingredients, set your preferences, and get AI-powered recipes with live Instamart pricing for anything you&apos;re missing.</p>
        </section>

        {/* Input section */}
        <section className="max-w-2xl mx-auto space-y-6 mb-10">
          <IngredientInput ingredients={ingredients} onIngredientsChange={setIngredients} disabled={loading} />

          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors">
            <svg className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            {showFilters ? "Hide" : "Show"} filters
            {(dietary.length > 0 || allergies.length > 0) && <span className="text-xs px-2 py-0.5 rounded-full bg-saffron/20 text-saffron">{dietary.length + allergies.length} active</span>}
          </button>

          {showFilters && (
            <div className="animate-fade-up">
              <FilterBar dietary={dietary} allergies={allergies} mealType={mealType} onDietaryChange={setDietary} onAllergiesChange={setAllergies} onMealTypeChange={setMealType} disabled={loading} />
            </div>
          )}

          <button onClick={findRecipes} disabled={ingredients.length === 0 || loading} className="w-full btn-glow py-3.5 rounded-2xl text-base font-semibold flex items-center justify-center gap-2">
            {loading ? <><div className="spinner w-5 h-5" />Finding recipes...</> : <>🍳 Find Recipes</>}
          </button>
        </section>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-chili/10 border border-chili/20 text-chili text-sm animate-fade-up">⚠ {error}</div>
        )}

        {/* Loading */}
        {loading && <ShimmerLoader />}

        {/* Results */}
        {!loading && recipes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-[var(--font-display)]">
                <span className="text-saffron">{recipes.length}</span> recipes found
              </h2>
              <p className="text-xs text-muted">Ranked by ingredient match</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map((recipe, i) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={i} onViewRecipe={setSelectedRecipe} onOrderMissing={handleOrderMissing} onSave={handleSave} isSaved={savedIds.includes(recipe.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && recipes.length === 0 && ingredients.length === 0 && (
          <div className="text-center py-16 animate-fade-up">
            <div className="text-6xl mb-4 animate-float">🥘</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ready to cook something amazing?</h3>
            <p className="text-sm text-muted max-w-md mx-auto">Start by adding the ingredients you have at home. Our AI will suggest delicious recipes and show you exactly what else you need.</p>
          </div>
        )}
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthenticated={handleAuthenticated} />
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} items={cartItems} subtotal={cartSubtotal} deliveryFee={deliveryFee} total={cartSubtotal + deliveryFee} onCheckout={handleCheckout} />
    </>
  );
}
