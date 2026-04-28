// ============================================
// Last-Minute Chef — Shared Type Definitions
// ============================================

export interface Ingredient {
  name: string;
  quantity: string;
  available: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: NutritionInfo;
  matchPercentage: number;
  missingCost: number;
  estimatedCost?: number;
}

export interface RecipeRequest {
  ingredients: string[];
  dietary: string[];
  allergies: string[];
  mealType: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  unit: string;
  imageUrl: string;
  ingredientMatch: string;
}

export interface CartItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
  brand: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface Filters {
  dietary: string[];
  allergies: string[];
  mealType: string;
}

export interface OrderConfirmation {
  orderId: string;
  status: "confirmed";
  estimatedDelivery: string;
  items: CartItem[];
  total: number;
}

export type DietaryFilter =
  | "Vegetarian"
  | "Vegan"
  | "Jain"
  | "Gluten-Free"
  | "Dairy-Free"
  | "High-Protein"
  | "Low-Carb";

export type AllergyFilter =
  | "Nuts"
  | "Dairy"
  | "Gluten"
  | "Soy"
  | "Shellfish"
  | "Eggs";

export type MealType =
  | "Any"
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Snack";
