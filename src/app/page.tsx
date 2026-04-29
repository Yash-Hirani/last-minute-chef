"use client";

import { useState } from "react";
import Header from "@/components/Header";
import IngredientInput from "@/components/IngredientInput";
import FilterBar from "@/components/FilterBar";
import RecipeCard from "@/components/RecipeCard";
import RecipeDetail from "@/components/RecipeDetail";
import ShimmerLoader from "@/components/ShimmerLoader";
import AuthModal from "@/components/AuthModal";
import CartSidebar from "@/components/CartSidebar";
import { Recipe, Filters, CartItem } from "@/lib/types";

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({ dietary: [], allergies: [], mealType: "Any" });
  const [showFilters, setShowFilters] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pendingOrder, setPendingOrder] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loadingNormal, setLoadingNormal] = useState(false);

  const findRecipes = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError(null);
    setRecipes([]);
    try {
      const res = await fetch("/api/recipes/normal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, dietary: filters.dietary, allergies: filters.allergies, mealType: filters.mealType }),
      });
      if (!res.ok) throw new Error("Failed to fetch recipes");
      const data = await res.json();
      if (data.recipes) {
        setRecipes(data.recipes.sort((a: Recipe, b: Recipe) => b.matchPercentage - a.matchPercentage));
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAIRecipes = async () => {
    if (ingredients.length === 0) return;
    setLoadingNormal(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, dietary: filters.dietary, allergies: filters.allergies, mealType: filters.mealType }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate AI recipes");
      }
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (!reader) throw new Error("No readable stream");
      
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const recipe = JSON.parse(line);
              setRecipes(prev => {
                const existingNames = new Set(prev.map(r => r.name));
                if (existingNames.has(recipe.name)) return prev;
                return [...prev, recipe];
              });
            } catch (err) {
              console.error("Failed to parse recipe line:", err);
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      // Clean up the error message to remove the long prefix if it's a Gemini error
      let errMsg = err?.message || "Failed to generate AI recipes.";
      if (errMsg.includes("503 Service Unavailable")) {
        errMsg = "Google's AI is currently experiencing high demand. Please try again in a moment.";
      } else if (errMsg.includes("[GoogleGenerativeAI Error]:")) {
        errMsg = errMsg.split("] ").pop() || errMsg;
      }
      setError(errMsg);
    } finally {
      setLoadingNormal(false);
    }
  };

  const handleOrder = (recipe: Recipe) => {
    if (!isAuthenticated) {
      setPendingOrder(recipe);
      setShowAuth(true);
      return;
    }
    const missing = recipe.ingredients.filter((i) => !i.available);
    const newItems: CartItem[] = missing.map((ing) => ({ name: ing.name, quantity: 1, price: Math.floor(Math.random() * 50) + 15, unit: "1 pack", brand: "Local" }));
    setCartItems((prev) => {
      const existing = [...prev];
      newItems.forEach((item) => { if (!existing.find((e) => e.name === item.name)) existing.push(item); });
      return existing;
    });
    setShowCart(true);
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    if (pendingOrder) { handleOrder(pendingOrder); setPendingOrder(null); }
  };

  const handleSave = (recipe: Recipe) => {
    setSavedRecipes((prev) => prev.includes(recipe.name) ? prev.filter((n) => n !== recipe.name) : [...prev, recipe.name]);
  };

  const handleCheckout = () => {
    alert("🎉 Order placed! Your ingredients will arrive in 15-25 minutes via Instamart.");
    setCartItems([]);
    setShowCart(false);
  };

  return (
    <>
      <Header savedCount={savedRecipes.length} cartCount={cartItems.length} onCartClick={() => setShowCart(true)} />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/30 via-surface to-surface pt-16 pb-12">
          {/* Warm glow bg */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-2xl mx-auto px-5 sm:px-6 text-center">
            {/* Powered by badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/20 text-xs text-on-surface-variant mb-6 shadow-ambient-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              According to Indian taste · Prices from Instamart
            </div>

            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface leading-[1.15] mb-3">
              Cook what you have.
              <br />
              <span className="text-primary">Order what you don&apos;t.</span>
            </h1>
            <p className="text-base sm:text-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed mb-10">
              Enter your ingredients, set your preferences, and get Indian recipes with live Instamart pricing for anything you&apos;re missing.
            </p>

            {/* Input area */}
            <div className="max-w-xl mx-auto space-y-4 text-left">
              <IngredientInput ingredients={ingredients} onIngredientsChange={setIngredients} disabled={loading} />
              <FilterBar filters={filters} onFiltersChange={setFilters} isVisible={showFilters} onToggle={() => setShowFilters(!showFilters)} />
              <button onClick={findRecipes} disabled={ingredients.length === 0 || loading} className="btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-2">
                {loading ? <span className="spinner w-5 h-5" /> : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Find Recipes
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="max-w-5xl mx-auto px-5 sm:px-6 py-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error-light/30 border border-error/20 text-error text-sm text-center font-medium">{error}</div>
          )}

          {loading && <ShimmerLoader />}

          {!loading && recipes.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-[var(--font-display)] text-xl font-bold text-on-surface">
                  <span className="text-primary">{recipes.length}</span> recipes found
                </h2>
                <span className="text-xs text-on-surface-variant font-medium">Ranked by ingredient match</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {recipes.map((recipe, i) => (
                  <RecipeCard key={recipe.name} recipe={recipe} onViewRecipe={setSelectedRecipe} onOrder={handleOrder} onSave={handleSave} isSaved={savedRecipes.includes(recipe.name)} index={i} />
                ))}
              </div>
              
              <div className="mt-10 text-center">
                <button 
                  onClick={fetchAIRecipes} 
                  disabled={loadingNormal}
                  className="px-6 py-3 rounded-full border-2 border-primary/20 text-primary font-semibold hover:bg-primary/5 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingNormal ? <span className="spinner w-4 h-4" /> : "Invent more with AI"}
                </button>
              </div>
            </>
          )}

          {!loading && recipes.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-float">🍳</div>
              <h3 className="font-[var(--font-display)] text-xl font-semibold text-on-surface mb-2">Ready to cook something amazing?</h3>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">Start by adding the ingredients you have at home. Our AI will suggest the best recipes and help you order anything you&apos;re missing.</p>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {selectedRecipe && <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} onOrderMissing={handleOrder} />}
      <AuthModal isOpen={showAuth} onClose={() => { setShowAuth(false); setPendingOrder(null); }} onAuthenticated={handleAuthenticated} />
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} items={cartItems} onRemove={(name) => setCartItems((prev) => prev.filter((i) => i.name !== name))} onCheckout={handleCheckout} />
    </>
  );
}
