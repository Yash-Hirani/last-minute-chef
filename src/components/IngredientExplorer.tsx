"use client";

import { useState, useMemo } from "react";
import { INGREDIENT_CATALOG } from "@/lib/ingredients";

interface Props {
  currentIngredients: string[];
  onAddIngredients: (ingredients: string[]) => void;
  onClose: () => void;
}

const CATEGORIES = [
  "All",
  "Vegetables",
  "Spices & Masalas",
  "Lentils & Dal",
  "Grains",
  "Dairy",
  "Meat & Poultry",
  "Seafood",
  "Eggs",
  "Nuts & Dry Fruits",
  "Pantry Staples"
];

export default function IngredientExplorer({ currentIngredients, onAddIngredients, onClose }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Track selected ingredients in the modal (both existing and newly selected)
  const [selected, setSelected] = useState<Set<string>>(new Set(currentIngredients));

  const filteredCatalog = useMemo(() => {
    return INGREDIENT_CATALOG.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const toggleSelection = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelected(next);
  };

  const handleSave = () => {
    onAddIngredients(Array.from(selected));
    onClose();
  };

  const newlyAddedCount = Array.from(selected).filter(x => !currentIngredients.includes(x)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-on-surface/30 backdrop-blur-sm pt-8 pb-8 px-4">
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded-2xl shadow-ambient-3 animate-fade-up flex flex-col max-h-[85vh]">
        
        {/* Header & Search */}
        <div className="p-5 border-b border-outline-variant/15 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-on-surface">Browse Ingredients</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search vegetables, spices, lentils..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-5 py-3 border-b border-outline-variant/15 flex-shrink-0 overflow-x-auto no-scrollbar flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat 
                  ? "bg-primary text-on-primary" 
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredCatalog.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant">
              No ingredients found matching "{searchTerm}"
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredCatalog.map((item) => {
                const isSelected = selected.has(item.searchKey);
                return (
                  <button
                    key={item.searchKey}
                    onClick={() => toggleSelection(item.searchKey)}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                      isSelected 
                        ? "bg-secondary/10 border-secondary shadow-sm" 
                        : "bg-surface-container-lowest border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold text-on-surface">{item.name}</span>
                      {isSelected ? (
                        <span className="text-secondary">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </span>
                      ) : (
                        <span className="text-on-surface-variant opacity-50 text-lg leading-none">+</span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant mt-auto">~₹{item.priceHint}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-outline-variant/15 flex justify-between items-center bg-surface-container-lowest flex-shrink-0 rounded-b-2xl">
          <div className="text-sm">
            <span className="font-semibold text-on-surface">{selected.size}</span>
            <span className="text-on-surface-variant"> selected in total</span>
          </div>
          <button 
            onClick={handleSave} 
            className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
          >
            Add to Pantry
            {newlyAddedCount > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">+{newlyAddedCount}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
