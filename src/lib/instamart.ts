// ============================================
// Mock Instamart Service
// Simulates Swiggy Instamart MCP endpoints
// Replace with real MCP calls when credentials arrive
// ============================================

import { Product, CartItem, Cart, OrderConfirmation } from "./types";

// Realistic Indian grocery pricing dictionary
const PRODUCT_DATABASE: Record<string, Omit<Product, "id" | "ingredientMatch">> = {
  // Dairy
  "cream": { name: "Amul Fresh Cream", brand: "Amul", price: 45, unit: "200ml", imageUrl: "/products/cream.webp" },
  "fresh cream": { name: "Amul Fresh Cream", brand: "Amul", price: 45, unit: "200ml", imageUrl: "/products/cream.webp" },
  "butter": { name: "Amul Butter", brand: "Amul", price: 56, unit: "100g", imageUrl: "/products/butter.webp" },
  "milk": { name: "Amul Taaza Milk", brand: "Amul", price: 33, unit: "500ml", imageUrl: "/products/milk.webp" },
  "curd": { name: "Mother Dairy Curd", brand: "Mother Dairy", price: 35, unit: "400g", imageUrl: "/products/curd.webp" },
  "yogurt": { name: "Mother Dairy Yogurt", brand: "Mother Dairy", price: 35, unit: "400g", imageUrl: "/products/yogurt.webp" },
  "cheese": { name: "Amul Cheese Slices", brand: "Amul", price: 99, unit: "200g", imageUrl: "/products/cheese.webp" },
  "paneer": { name: "Amul Malai Paneer", brand: "Amul", price: 90, unit: "200g", imageUrl: "/products/paneer.webp" },

  // Vegetables
  "capsicum": { name: "Green Capsicum", brand: "Fresh", price: 32, unit: "250g", imageUrl: "/products/capsicum.webp" },
  "bell pepper": { name: "Mixed Bell Peppers", brand: "Fresh", price: 58, unit: "300g", imageUrl: "/products/bellpepper.webp" },
  "potato": { name: "Fresh Potato", brand: "Farm Fresh", price: 25, unit: "500g", imageUrl: "/products/potato.webp" },
  "potatoes": { name: "Fresh Potato", brand: "Farm Fresh", price: 25, unit: "500g", imageUrl: "/products/potato.webp" },
  "tomato": { name: "Fresh Tomato", brand: "Farm Fresh", price: 28, unit: "500g", imageUrl: "/products/tomato.webp" },
  "tomatoes": { name: "Fresh Tomato", brand: "Farm Fresh", price: 28, unit: "500g", imageUrl: "/products/tomato.webp" },
  "onion": { name: "Fresh Onion", brand: "Farm Fresh", price: 30, unit: "500g", imageUrl: "/products/onion.webp" },
  "onions": { name: "Fresh Onion", brand: "Farm Fresh", price: 30, unit: "500g", imageUrl: "/products/onion.webp" },
  "spinach": { name: "Fresh Baby Spinach", brand: "Farm Fresh", price: 22, unit: "200g", imageUrl: "/products/spinach.webp" },
  "palak": { name: "Fresh Baby Spinach", brand: "Farm Fresh", price: 22, unit: "200g", imageUrl: "/products/spinach.webp" },
  "green peas": { name: "Frozen Green Peas", brand: "Safal", price: 42, unit: "500g", imageUrl: "/products/peas.webp" },
  "peas": { name: "Frozen Green Peas", brand: "Safal", price: 42, unit: "500g", imageUrl: "/products/peas.webp" },
  "cauliflower": { name: "Fresh Cauliflower", brand: "Farm Fresh", price: 35, unit: "1 pc", imageUrl: "/products/cauliflower.webp" },
  "brinjal": { name: "Fresh Brinjal", brand: "Farm Fresh", price: 20, unit: "250g", imageUrl: "/products/brinjal.webp" },
  "carrot": { name: "Fresh Carrot", brand: "Farm Fresh", price: 28, unit: "250g", imageUrl: "/products/carrot.webp" },
  "carrots": { name: "Fresh Carrot", brand: "Farm Fresh", price: 28, unit: "250g", imageUrl: "/products/carrot.webp" },
  "mushroom": { name: "Button Mushroom", brand: "Farm Fresh", price: 45, unit: "200g", imageUrl: "/products/mushroom.webp" },
  "mushrooms": { name: "Button Mushroom", brand: "Farm Fresh", price: 45, unit: "200g", imageUrl: "/products/mushroom.webp" },
  "ginger": { name: "Fresh Ginger", brand: "Farm Fresh", price: 15, unit: "100g", imageUrl: "/products/ginger.webp" },
  "garlic": { name: "Fresh Garlic", brand: "Farm Fresh", price: 18, unit: "100g", imageUrl: "/products/garlic.webp" },
  "green chili": { name: "Green Chilli", brand: "Farm Fresh", price: 10, unit: "100g", imageUrl: "/products/greenchili.webp" },
  "green chillies": { name: "Green Chilli", brand: "Farm Fresh", price: 10, unit: "100g", imageUrl: "/products/greenchili.webp" },
  "coriander leaves": { name: "Fresh Coriander", brand: "Farm Fresh", price: 10, unit: "100g", imageUrl: "/products/coriander.webp" },
  "coriander": { name: "Fresh Coriander", brand: "Farm Fresh", price: 10, unit: "100g", imageUrl: "/products/coriander.webp" },
  "mint leaves": { name: "Fresh Mint Leaves", brand: "Farm Fresh", price: 10, unit: "50g", imageUrl: "/products/mint.webp" },
  "mint": { name: "Fresh Mint Leaves", brand: "Farm Fresh", price: 10, unit: "50g", imageUrl: "/products/mint.webp" },
  "curry leaves": { name: "Fresh Curry Leaves", brand: "Farm Fresh", price: 8, unit: "50g", imageUrl: "/products/curryleaves.webp" },
  "lemon": { name: "Fresh Lemon", brand: "Farm Fresh", price: 12, unit: "4 pcs", imageUrl: "/products/lemon.webp" },
  "coconut": { name: "Fresh Coconut", brand: "Farm Fresh", price: 35, unit: "1 pc", imageUrl: "/products/coconut.webp" },

  // Spices & Condiments
  "kasuri methi": { name: "MDH Kasuri Methi", brand: "MDH", price: 28, unit: "25g", imageUrl: "/products/kasurimethi.webp" },
  "garam masala": { name: "MDH Garam Masala", brand: "MDH", price: 55, unit: "100g", imageUrl: "/products/garammasala.webp" },
  "turmeric powder": { name: "MDH Turmeric Powder", brand: "MDH", price: 35, unit: "100g", imageUrl: "/products/turmeric.webp" },
  "turmeric": { name: "MDH Turmeric Powder", brand: "MDH", price: 35, unit: "100g", imageUrl: "/products/turmeric.webp" },
  "red chili powder": { name: "MDH Red Chili Powder", brand: "MDH", price: 40, unit: "100g", imageUrl: "/products/chilipowder.webp" },
  "chili powder": { name: "MDH Red Chili Powder", brand: "MDH", price: 40, unit: "100g", imageUrl: "/products/chilipowder.webp" },
  "cumin powder": { name: "MDH Cumin Powder", brand: "MDH", price: 45, unit: "100g", imageUrl: "/products/cuminpowder.webp" },
  "cumin seeds": { name: "MDH Cumin Seeds", brand: "MDH", price: 42, unit: "100g", imageUrl: "/products/cuminseeds.webp" },
  "cumin": { name: "MDH Cumin Seeds", brand: "MDH", price: 42, unit: "100g", imageUrl: "/products/cuminseeds.webp" },
  "coriander powder": { name: "MDH Coriander Powder", brand: "MDH", price: 38, unit: "100g", imageUrl: "/products/corianderpowder.webp" },
  "mustard seeds": { name: "MDH Mustard Seeds", brand: "MDH", price: 25, unit: "100g", imageUrl: "/products/mustardseeds.webp" },
  "soy sauce": { name: "Ching's Dark Soy Sauce", brand: "Ching's", price: 55, unit: "200ml", imageUrl: "/products/soysauce.webp" },
  "vinegar": { name: "Gourmet White Vinegar", brand: "Gourmet", price: 38, unit: "200ml", imageUrl: "/products/vinegar.webp" },
  "tomato paste": { name: "Kissan Tomato Puree", brand: "Kissan", price: 42, unit: "200g", imageUrl: "/products/tomatopaste.webp" },
  "tomato puree": { name: "Kissan Tomato Puree", brand: "Kissan", price: 42, unit: "200g", imageUrl: "/products/tomatopaste.webp" },
  "coconut milk": { name: "KLF Coconut Milk", brand: "KLF", price: 65, unit: "400ml", imageUrl: "/products/coconutmilk.webp" },

  // Grains & Lentils
  "rice": { name: "India Gate Basmati Rice", brand: "India Gate", price: 85, unit: "1kg", imageUrl: "/products/rice.webp" },
  "basmati rice": { name: "India Gate Basmati Rice", brand: "India Gate", price: 85, unit: "1kg", imageUrl: "/products/rice.webp" },
  "wheat flour": { name: "Aashirvaad Atta", brand: "Aashirvaad", price: 55, unit: "1kg", imageUrl: "/products/atta.webp" },
  "atta": { name: "Aashirvaad Atta", brand: "Aashirvaad", price: 55, unit: "1kg", imageUrl: "/products/atta.webp" },
  "besan": { name: "Rajdhani Besan", brand: "Rajdhani", price: 45, unit: "500g", imageUrl: "/products/besan.webp" },
  "dal": { name: "Toor Dal", brand: "Tata Sampann", price: 75, unit: "500g", imageUrl: "/products/dal.webp" },
  "toor dal": { name: "Toor Dal", brand: "Tata Sampann", price: 75, unit: "500g", imageUrl: "/products/dal.webp" },
  "chana dal": { name: "Chana Dal", brand: "Tata Sampann", price: 68, unit: "500g", imageUrl: "/products/chanadal.webp" },
  "moong dal": { name: "Moong Dal", brand: "Tata Sampann", price: 72, unit: "500g", imageUrl: "/products/moongdal.webp" },
  "pasta": { name: "Barilla Penne Pasta", brand: "Barilla", price: 125, unit: "500g", imageUrl: "/products/pasta.webp" },
  "noodles": { name: "Ching's Hakka Noodles", brand: "Ching's", price: 35, unit: "150g", imageUrl: "/products/noodles.webp" },
  "bread": { name: "Britannia Brown Bread", brand: "Britannia", price: 42, unit: "400g", imageUrl: "/products/bread.webp" },

  // Proteins
  "chicken": { name: "Fresh Chicken Curry Cut", brand: "Licious", price: 175, unit: "500g", imageUrl: "/products/chicken.webp" },
  "eggs": { name: "Farm Fresh Eggs", brand: "Eggoz", price: 72, unit: "6 pcs", imageUrl: "/products/eggs.webp" },
  "egg": { name: "Farm Fresh Eggs", brand: "Eggoz", price: 72, unit: "6 pcs", imageUrl: "/products/eggs.webp" },
  "fish": { name: "Fresh Rohu Fish", brand: "FreshToHome", price: 195, unit: "500g", imageUrl: "/products/fish.webp" },
  "prawns": { name: "Fresh Prawns", brand: "FreshToHome", price: 350, unit: "500g", imageUrl: "/products/prawns.webp" },
  "tofu": { name: "Nutrela Tofu", brand: "Nutrela", price: 65, unit: "200g", imageUrl: "/products/tofu.webp" },
  "soya chunks": { name: "Nutrela Soya Chunks", brand: "Nutrela", price: 52, unit: "200g", imageUrl: "/products/soyachunks.webp" },

  // Others
  "sugar": { name: "Madhur Sugar", brand: "Madhur", price: 45, unit: "1kg", imageUrl: "/products/sugar.webp" },
  "jaggery": { name: "Organic Jaggery", brand: "24 Mantra", price: 55, unit: "500g", imageUrl: "/products/jaggery.webp" },
  "cashew": { name: "Happilo Cashews", brand: "Happilo", price: 145, unit: "200g", imageUrl: "/products/cashew.webp" },
  "cashews": { name: "Happilo Cashews", brand: "Happilo", price: 145, unit: "200g", imageUrl: "/products/cashew.webp" },
  "almonds": { name: "Happilo Almonds", brand: "Happilo", price: 165, unit: "200g", imageUrl: "/products/almonds.webp" },
  "raisins": { name: "Happilo Raisins", brand: "Happilo", price: 85, unit: "200g", imageUrl: "/products/raisins.webp" },
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function searchProduct(ingredientName: string): Product {
  const key = ingredientName.toLowerCase().trim();

  // Direct match
  if (PRODUCT_DATABASE[key]) {
    return {
      ...PRODUCT_DATABASE[key],
      id: generateId(),
      ingredientMatch: ingredientName,
    };
  }

  // Partial match — check if any key is contained in the query or vice versa
  for (const [dbKey, product] of Object.entries(PRODUCT_DATABASE)) {
    if (key.includes(dbKey) || dbKey.includes(key)) {
      return {
        ...product,
        id: generateId(),
        ingredientMatch: ingredientName,
      };
    }
  }

  // Fallback — generate a reasonable product entry
  const estimatedPrice = 30 + Math.floor(Math.random() * 50);
  return {
    id: generateId(),
    name: ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1),
    brand: "Local",
    price: estimatedPrice,
    unit: "1 pack",
    imageUrl: "/products/default.webp",
    ingredientMatch: ingredientName,
  };
}

export function searchProducts(ingredientNames: string[]): Product[] {
  return ingredientNames.map(searchProduct);
}

// In-memory cart (per-server-process, fine for prototype)
let currentCart: CartItem[] = [];

export function addToCart(products: Product[]): Cart {
  for (const product of products) {
    const existing = currentCart.find((item) => item.product.name === product.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      currentCart.push({ product, quantity: 1 });
    }
  }
  return getCart();
}

export function getCart(): Cart {
  const subtotal = currentCart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 0 ? 25 : 0;
  return {
    items: currentCart,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
}

export function clearCart(): Cart {
  currentCart = [];
  return getCart();
}

export function checkout(): OrderConfirmation {
  const cart = getCart();
  const eta = 15 + Math.floor(Math.random() * 15); // 15-30 min ETA
  const order: OrderConfirmation = {
    orderId: `SWG${Date.now().toString(36).toUpperCase()}`,
    status: "confirmed",
    estimatedDelivery: `${eta} minutes`,
    items: [...cart.items],
    total: cart.total,
  };
  currentCart = [];
  return order;
}
