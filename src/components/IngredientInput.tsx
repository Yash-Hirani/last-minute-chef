"use client";

import { useState, useRef, KeyboardEvent } from "react";

const SUGGESTIONS = [
  "paneer", "spinach", "onion", "garlic", "tomato", "potato", "ginger",
  "cumin", "coriander", "turmeric", "green chili", "capsicum", "mushroom",
  "rice", "dal", "chicken", "eggs", "butter", "cream", "peas",
  "cauliflower", "carrot", "beans", "lemon", "coconut", "mint",
];

interface Props {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  disabled?: boolean;
}

export default function IngredientInput({ ingredients, onIngredientsChange, disabled = false }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = SUGGESTIONS.filter(
    (s) => s.includes(inputValue.toLowerCase()) && !ingredients.includes(s)
  ).slice(0, 6);

  const add = (val: string) => {
    const t = val.trim().toLowerCase();
    if (t && !ingredients.includes(t)) onIngredientsChange([...ingredients, t]);
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const remove = (val: string) => onIngredientsChange(ingredients.filter((i) => i !== val));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) { e.preventDefault(); add(inputValue); }
    else if (e.key === "Backspace" && !inputValue && ingredients.length > 0) remove(ingredients[ingredients.length - 1]);
  };

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-muted-light mb-2">What ingredients do you have?</label>
      <div
        className={`glass rounded-2xl px-4 py-3 flex flex-wrap gap-2 items-center min-h-[56px] cursor-text transition-all duration-200 ${disabled ? "opacity-60 pointer-events-none" : "hover:border-saffron/30 focus-within:border-saffron/50 focus-within:shadow-lg focus-within:shadow-saffron/5"}`}
        onClick={() => inputRef.current?.focus()}
      >
        {ingredients.map((ing) => (
          <span key={ing} className="tag-enter inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-saffron/15 text-saffron-light border border-saffron/20">
            {ing}
            <button onClick={(e) => { e.stopPropagation(); remove(ing); }} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-saffron/30 transition-colors text-xs" disabled={disabled}>×</button>
          </span>
        ))}
        <input ref={inputRef} type="text" value={inputValue} onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(e.target.value.length > 0); }} onFocus={() => setShowSuggestions(inputValue.length > 0)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} onKeyDown={handleKeyDown} placeholder={ingredients.length === 0 ? "Type an ingredient and press Enter..." : "Add more..."} className="flex-1 min-w-[150px] bg-transparent border-none outline-none text-foreground placeholder:text-muted text-sm" disabled={disabled} id="ingredient-input" />
      </div>
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl overflow-hidden z-40 shadow-2xl">
          {filtered.map((s) => (
            <button key={s} onMouseDown={(e) => { e.preventDefault(); add(s); }} className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-saffron/10 transition-colors flex items-center gap-2">
              <span className="text-saffron text-xs">+</span>{s}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted">{ingredients.length === 0 ? "Start typing to see suggestions" : `${ingredients.length} ingredient${ingredients.length > 1 ? "s" : ""} added`}</p>
        {ingredients.length > 0 && <button onClick={() => onIngredientsChange([])} className="text-xs text-chili/70 hover:text-chili transition-colors" disabled={disabled}>Clear all</button>}
      </div>
    </div>
  );
}
