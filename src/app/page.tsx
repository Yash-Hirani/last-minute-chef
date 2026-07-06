"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import IngredientInput from "@/components/IngredientInput";
import FilterBar from "@/components/FilterBar";
import RecipeCard from "@/components/RecipeCard";
import RecipeDetail from "@/components/RecipeDetail";
import ShimmerLoader from "@/components/ShimmerLoader";
import AuthModal from "@/components/AuthModal";
import CartSidebar from "@/components/CartSidebar";
import SortBar from "@/components/SortBar";
import IngredientExplorer from "@/components/IngredientExplorer";
import SavedRecipesPanel from "@/components/SavedRecipesPanel";
import BottomNav from "@/components/BottomNav";
import SwiggyConnectModal from "@/components/SwiggyConnectModal";
import { Recipe, Filters, CartItem, SortMode } from "@/lib/types";
import { useAuth } from "@/lib/authContext";
import { useEffect } from "react";
import { toggleSaveRecipeDb, getSavedRecipesDb } from "@/lib/store";

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({ 
    dietary: [], 
    allergies: [], 
    mealType: "Any",
    cuisine: "Any",
    courseType: "Any",
    tasteProfile: "Any",
    healthLevel: "Any",
    maxTimeMins: "Any"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("match");
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeContext, setSelectedRecipeContext] = useState<"search" | "saved">("search");
  
  // Auth & Saved Recipes
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authReason, setAuthReason] = useState<"ai" | "save" | "order" | null>(null);
  const [dbSavedRecipes, setDbSavedRecipes] = useState<Recipe[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [showSwiggyConnect, setShowSwiggyConnect] = useState(false);

  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pendingOrder, setPendingOrder] = useState<Recipe | null>(null);
  const [pendingSave, setPendingSave] = useState<Recipe | null>(null);
  const [pendingAi, setPendingAi] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<"normal" | "ai" | null>(null);

  const [loadingNormal, setLoadingNormal] = useState(false);
  const [aiUsesLeft, setAiUsesLeft] = useState<number | null>(null); // null = not yet fetched

  // Hydrate state from sessionStorage on mount
  useEffect(() => {
    try {
      const storedIngredients = sessionStorage.getItem("lmc_ingredients");
      if (storedIngredients) setIngredients(JSON.parse(storedIngredients));

      const storedRecipes = sessionStorage.getItem("lmc_recipes");
      if (storedRecipes) setRecipes(JSON.parse(storedRecipes));

      const storedFilters = sessionStorage.getItem("lmc_filters");
      if (storedFilters) setFilters(JSON.parse(storedFilters));

      const storedPendingAi = sessionStorage.getItem("lmc_pendingAi");
      if (storedPendingAi) setPendingAi(JSON.parse(storedPendingAi));

      const storedPendingOrder = sessionStorage.getItem("lmc_pendingOrder");
      if (storedPendingOrder) setPendingOrder(JSON.parse(storedPendingOrder));

      const storedPendingSave = sessionStorage.getItem("lmc_pendingSave");
      if (storedPendingSave) setPendingSave(JSON.parse(storedPendingSave));
    } catch (e) {
      console.error("Failed to restore state from sessionStorage", e);
    }
  }, []);

  // Sync state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("lmc_ingredients", JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    sessionStorage.setItem("lmc_recipes", JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    sessionStorage.setItem("lmc_filters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    sessionStorage.setItem("lmc_pendingAi", JSON.stringify(pendingAi));
  }, [pendingAi]);

  useEffect(() => {
    if (pendingOrder) {
      sessionStorage.setItem("lmc_pendingOrder", JSON.stringify(pendingOrder));
    } else {
      sessionStorage.removeItem("lmc_pendingOrder");
    }
  }, [pendingOrder]);

  useEffect(() => {
    if (pendingSave) {
      sessionStorage.setItem("lmc_pendingSave", JSON.stringify(pendingSave));
    } else {
      sessionStorage.removeItem("lmc_pendingSave");
    }
  }, [pendingSave]);

  useEffect(() => {
    if (user) {
      setLoadingSaved(true);
      getSavedRecipesDb(user.id).then((recipes) => {
        setDbSavedRecipes(recipes);
        setLoadingSaved(false);
      });
      // Handle pending actions
      if (pendingOrder) { handleOrder(pendingOrder); setPendingOrder(null); }
      if (pendingSave) { handleSave(pendingSave); setPendingSave(null); }
      if (pendingAi) { fetchAIRecipes(); setPendingAi(false); }
    } else {
      setDbSavedRecipes([]);
    }
  }, [user]);

  const findRecipes = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError(null);
    setLastAction("normal");
    setRecipes([]);
    setSortMode("match");
    try {
      const res = await fetch("/api/recipes/normal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ingredients, 
          dietary: filters.dietary, 
          allergies: filters.allergies, 
          mealType: filters.mealType,
          cuisine: filters.cuisine,
          courseType: filters.courseType,
          tasteProfile: filters.tasteProfile,
          healthLevel: filters.healthLevel,
          maxTimeMins: filters.maxTimeMins
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch recipes");
      const data = await res.json();
      if (data.recipes) {
        setRecipes(data.recipes);
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
    if (!user) {
      setPendingAi(true);
      setAuthReason("ai");
      setShowAuth(true);
      return;
    }
    if (aiUsesLeft !== null && aiUsesLeft <= 0) return;
    setLoadingNormal(true);
    setError(null);
    setLastAction("ai");
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ingredients, 
          dietary: filters.dietary, 
          allergies: filters.allergies, 
          mealType: filters.mealType,
          cuisine: filters.cuisine,
          courseType: filters.courseType,
          tasteProfile: filters.tasteProfile,
          healthLevel: filters.healthLevel,
          maxTimeMins: filters.maxTimeMins
        }),
      });

      // Read remaining count from headers (present on all responses)
      const remaining = res.headers.get("X-RateLimit-Remaining");
      if (remaining !== null) setAiUsesLeft(parseInt(remaining, 10));

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setAiUsesLeft(0);
        }
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

  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => {
      if (sortMode === "match") {
        return b.matchPercentage - a.matchPercentage;
      } else if (sortMode === "cost") {
        return a.missingCost - b.missingCost;
      } else if (sortMode === "missing") {
        const missingA = a.ingredients.filter((i) => !i.available).length;
        const missingB = b.ingredients.filter((i) => !i.available).length;
        return missingA - missingB;
      }
      return 0;
    });
  }, [recipes, sortMode]);

  const handleOrder = (recipe: Recipe) => {
    if (!user) {
      setPendingOrder(recipe);
      setAuthReason("order");
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

  const handleSave = async (recipe: Recipe) => {
    if (!user) {
      setPendingSave(recipe);
      setAuthReason("save");
      setShowAuth(true);
      return;
    }

    // Optimistic UI update
    const isCurrentlySaved = dbSavedRecipes.some(r => r.id === recipe.id);
    if (isCurrentlySaved) {
      setDbSavedRecipes(prev => prev.filter(r => r.id !== recipe.id));
    } else {
      setDbSavedRecipes(prev => [recipe, ...prev]);
    }

    // DB update
    const isNowSaved = await toggleSaveRecipeDb(user.id, recipe);
    
    // Reconcile if optimistic update was wrong (rare, but good practice)
    if (isNowSaved === isCurrentlySaved) {
       getSavedRecipesDb(user.id).then(setDbSavedRecipes);
    }
  };

  const handleCheckout = () => {
    setShowSwiggyConnect(true);
  };

  const handleSwiggyConnected = () => {
    setShowSwiggyConnect(false);
    setCartItems([]);
    setShowCart(false);
    // In a real flow, this would redirect to the deep link or return order status
    setTimeout(() => {
      alert("🎉 Order successfully placed via Swiggy MCP! Ingredients will arrive via Instamart in 15-25 minutes.");
    }, 300);
  };

  return (
    <>
      <Header 
        savedCount={dbSavedRecipes.length} 
        cartCount={cartItems.length} 
        onCartClick={() => setShowCart(true)} 
        onSavedClick={() => setShowSavedPanel(true)}
        onSignInClick={() => setShowAuth(true)}
      />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden bg-surface-container-lowest pt-16 pb-12">
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
              <IngredientInput 
                ingredients={ingredients} 
                onIngredientsChange={setIngredients} 
                disabled={loading} 
                onOpenExplorer={() => setShowExplorer(true)}
              />
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
            <div className="mb-6 p-4 rounded-xl bg-error-light/30 border border-error/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-error text-sm font-medium">{error}</span>
              <button 
                onClick={() => lastAction === 'ai' ? fetchAIRecipes() : findRecipes()} 
                className="px-4 py-2 bg-error/10 text-error rounded-lg text-sm font-semibold hover:bg-error/20 transition-colors whitespace-nowrap"
              >
                Try Again
              </button>
            </div>
          )}

          {loading && <ShimmerLoader />}

          {!loading && recipes.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-[var(--font-display)] text-xl font-bold text-on-surface">
                  <span className="text-primary">{recipes.length}</span> recipes found
                </h2>
                <SortBar currentSort={sortMode} onSortChange={setSortMode} />
              </div>
              <div className="columns-1 md:columns-2 gap-5 space-y-5">
                {sortedRecipes.map((recipe, i) => (
                  <div key={recipe.id} className="break-inside-avoid">
                    <RecipeCard 
                      recipe={recipe} 
                      onViewRecipe={(r) => { setSelectedRecipe(r); setSelectedRecipeContext("search"); }} 
                      onOrder={handleOrder} 
                      onSave={handleSave} 
                      isSaved={dbSavedRecipes.some(r => r.id === recipe.id)} 
                      index={i} 
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-10 text-center space-y-2">
                <button 
                  onClick={fetchAIRecipes} 
                  disabled={loadingNormal || (aiUsesLeft !== null && aiUsesLeft <= 0)}
                  className="px-6 py-3 rounded-full border-2 border-primary/20 text-primary font-semibold hover:bg-primary/5 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingNormal ? <span className="spinner w-4 h-4" /> : "✨ Invent more with AI"}
                </button>
                {/* Quota badge */}
                {aiUsesLeft !== null && (
                  <p className="text-xs text-on-surface-variant">
                    {aiUsesLeft > 0
                      ? <><span className="font-semibold text-primary">{aiUsesLeft}</span> AI generation{aiUsesLeft !== 1 ? "s" : ""} remaining today</>
                      : <span className="text-error font-medium">Daily AI limit reached — resets in 24 h</span>
                    }
                  </p>
                )}
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
      {showExplorer && (
        <IngredientExplorer 
          currentIngredients={ingredients}
          onAddIngredients={(newIngs) => {
            const merged = Array.from(new Set([...ingredients, ...newIngs]));
            setIngredients(merged);
          }}
          onClose={() => setShowExplorer(false)}
        />
      )}
      {selectedRecipe && (
        <RecipeDetail 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
          onOrderMissing={handleOrder} 
          hideMissingContext={selectedRecipeContext === "saved"}
        />
      )}
      <AuthModal isOpen={showAuth} reason={authReason} onClose={() => { setShowAuth(false); setPendingOrder(null); setPendingSave(null); setPendingAi(false); }} onAuthenticated={() => setShowAuth(false)} />
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} items={cartItems} onRemove={(name) => setCartItems((prev) => prev.filter((i) => i.name !== name))} onCheckout={handleCheckout} />
      <SavedRecipesPanel 
        isOpen={showSavedPanel} 
        onClose={() => setShowSavedPanel(false)} 
        savedRecipes={dbSavedRecipes} 
        onRemove={handleSave} 
        onViewRecipe={(r) => { setSelectedRecipe(r); setSelectedRecipeContext("saved"); }} 
        loading={loadingSaved}
      />
      <SwiggyConnectModal
        isOpen={showSwiggyConnect}
        onClose={() => setShowSwiggyConnect(false)}
        onConnected={handleSwiggyConnected}
      />
      <BottomNav
        cartCount={cartItems.length}
        savedCount={dbSavedRecipes.length}
        onHomeClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onSavedClick={() => setShowSavedPanel(true)}
        onCartClick={() => setShowCart(true)}
      />
    </>
  );
}
