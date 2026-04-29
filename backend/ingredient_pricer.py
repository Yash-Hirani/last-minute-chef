"""
Ingredient Pricer
=================
Covers all ~5000 ingredients in the dataset via:
  1. Hand-priced dictionary for top 200 most common ingredients (exact match)
  2. Category-based fallback for everything else (keyword detection)
  3. Returns price in ₹, unit, and brand hint for UI display

All prices are realistic Instamart/Blinkit estimates (2024-25, Bengaluru).
Prices represent a typical purchase unit (e.g. 500g packet, 1 bunch).
"""

from __future__ import annotations
import re

# ─────────────────────────────────────────────────────────────────
# HAND-PRICED DICTIONARY
# Key = normalized ingredient string (lowercase, no parens)
# Value = (price_inr, unit_label, brand_hint)
# ─────────────────────────────────────────────────────────────────
PRICES: dict[str, tuple[int, str, str]] = {

    # ── Pantry staples ────────────────────────────────────────────
    "salt":                         (20,  "1 kg",      "Tata Salt"),
    "sugar":                        (50,  "1 kg",      "Uttam Sugar"),
    "oil":                          (180, "1 L",       "Fortune Sunflower Oil"),
    "sunflower oil":                (180, "1 L",       "Fortune Sunflower Oil"),
    "coconut oil":                  (220, "500 ml",    "Parachute Coconut Oil"),
    "mustard oil":                  (160, "1 L",       "Patanjali Mustard Oil"),
    "virgin olive oil":             (450, "500 ml",    "Figaro Olive Oil"),
    "ghee":                         (580, "500 g",     "Amul Ghee"),
    "butter":                       (55,  "100 g",     "Amul Butter"),
    "water":                        (0,   "",          "tap water"),
    "vinegar":                      (60,  "500 ml",    "Heinz White Vinegar"),
    "white vinegar":                (60,  "500 ml",    "Heinz White Vinegar"),

    # ── Fresh vegetables ──────────────────────────────────────────
    "onion":                        (40,  "1 kg",      "Fresh"),
    "tomato":                       (35,  "500 g",     "Fresh"),
    "garlic":                       (40,  "100 g",     "Fresh"),
    "cloves garlic":                (40,  "100 g",     "Fresh"),
    "ginger":                       (30,  "100 g",     "Fresh"),
    "green chillies":               (15,  "100 g",     "Fresh"),
    "green chilli":                 (15,  "100 g",     "Fresh"),
    "dry red chillies":             (30,  "50 g",      "Fresh"),
    "dry red chilli":               (30,  "50 g",      "Fresh"),
    "carrot":                       (30,  "500 g",     "Fresh"),
    "potato":                       (30,  "1 kg",      "Fresh"),
    "spinach":                      (25,  "250 g",     "Fresh"),
    "spinach leaves":               (25,  "250 g",     "Fresh"),
    "green peas":                   (40,  "250 g",     "Fresh/Frozen"),
    "cauliflower":                  (35,  "500 g",     "Fresh"),
    "capsicum":                     (40,  "250 g",     "Fresh"),
    "green bell pepper":            (40,  "250 g",     "Fresh"),
    "red bell pepper":              (60,  "250 g",     "Fresh"),
    "yellow bell pepper":           (65,  "250 g",     "Fresh"),
    "cucumber":                     (20,  "250 g",     "Fresh"),
    "bottle gourd":                 (25,  "500 g",     "Fresh"),
    "bitter gourd":                 (30,  "250 g",     "Fresh"),
    "okra":                         (30,  "250 g",     "Fresh"),
    "eggplant":                     (25,  "500 g",     "Fresh"),
    "brinjal":                      (25,  "500 g",     "Fresh"),
    "mushrooms":                    (50,  "200 g",     "Fresh"),
    "button mushrooms":             (50,  "200 g",     "Fresh"),
    "corn":                         (25,  "2 cobs",    "Fresh"),
    "sweet corn":                   (35,  "200 g",     "Fresh/Frozen"),
    "broccoli":                     (60,  "250 g",     "Fresh"),
    "cabbage":                      (25,  "500 g",     "Fresh"),
    "beans":                        (30,  "250 g",     "Fresh"),
    "green beans":                  (30,  "250 g",     "Fresh"),
    "pumpkin":                      (25,  "500 g",     "Fresh"),
    "radish":                       (20,  "250 g",     "Fresh"),
    "spring onion":                 (20,  "1 bunch",   "Fresh"),
    "drumstick":                    (30,  "3 pcs",     "Fresh"),
    "raw mango":                    (40,  "250 g",     "Fresh"),
    "mango":                        (80,  "500 g",     "Fresh"),
    "banana":                       (40,  "6 pcs",     "Fresh"),
    "lemon":                        (20,  "3 pcs",     "Fresh"),
    "coconut":                      (45,  "1 pc",      "Fresh"),
    "beetroot":                     (30,  "500 g",     "Fresh"),
    "baby potatoes":                (40,  "500 g",     "Fresh"),
    "jackfruit":                    (60,  "500 g",     "Fresh"),
    "raw banana":                   (30,  "4 pcs",     "Fresh"),
    "tamarind":                     (50,  "100 g",     "Tamicon"),
    "tamarind water":               (50,  "100 g",     "Tamicon"),

    # ── Fresh herbs ───────────────────────────────────────────────
    "coriander leaves":             (15,  "1 bunch",   "Fresh"),
    "coriander":                    (15,  "1 bunch",   "Fresh"),
    "mint leaves":                  (15,  "1 bunch",   "Fresh"),
    "curry leaves":                 (10,  "1 bunch",   "Fresh"),
    "basil leaves":                 (25,  "1 bunch",   "Fresh"),

    # ── Dairy & Eggs ─────────────────────────────────────────────
    "milk":                         (30,  "500 ml",    "Amul Milk"),
    "curd":                         (45,  "400 g",     "Amul Dahi"),
    "yogurt":                       (45,  "400 g",     "Amul Dahi"),
    "hung curd":                    (60,  "200 g",     "Epigamia Greek Yogurt"),
    "paneer":                       (90,  "200 g",     "Amul Paneer"),
    "cream":                        (65,  "200 ml",    "Amul Fresh Cream"),
    "cheese":                       (100, "200 g",     "Amul Cheese"),
    "mozzarella cheese":            (130, "200 g",     "Amul Mozzarella"),
    "condensed milk":               (80,  "400 g",     "Milkmaid"),
    "eggs":                         (90,  "12 pcs",    "Nandus Eggs"),
    "egg":                          (90,  "12 pcs",    "Nandus Eggs"),
    "buttermilk":                   (25,  "500 ml",    "Amul Buttermilk"),

    # ── Meat & Seafood ────────────────────────────────────────────
    "chicken":                      (200, "500 g",     "FreshToHome"),
    "chicken breast":               (220, "500 g",     "FreshToHome"),
    "boneless chicken":             (240, "500 g",     "FreshToHome"),
    "mutton":                       (450, "500 g",     "FreshToHome"),
    "lamb":                         (450, "500 g",     "FreshToHome"),
    "fish":                         (250, "500 g",     "FreshToHome"),
    "prawns":                       (350, "250 g",     "FreshToHome"),
    "shrimps":                      (350, "250 g",     "FreshToHome"),

    # ── Lentils & Pulses ─────────────────────────────────────────
    "arhar dal":                    (120, "500 g",     "Tata Sampann"),
    "toor dal":                     (120, "500 g",     "Tata Sampann"),
    "moong dal":                    (100, "500 g",     "Tata Sampann"),
    "yellow moong dal":             (100, "500 g",     "Tata Sampann"),
    "green moong dal":              (110, "500 g",     "Tata Sampann"),
    "chana dal":                    (90,  "500 g",     "Tata Sampann"),
    "urad dal":                     (100, "500 g",     "Tata Sampann"),
    "white urad dal":               (100, "500 g",     "Tata Sampann"),
    "masoor dal":                   (90,  "500 g",     "Tata Sampann"),
    "dal":                          (100, "500 g",     "Tata Sampann"),
    "chickpeas":                    (80,  "500 g",     "Tata Sampann"),
    "kidney beans":                 (90,  "500 g",     "Tata Sampann"),
    "rajma":                        (90,  "500 g",     "Tata Sampann"),

    # ── Rice, Grains & Pasta ─────────────────────────────────────
    "rice":                         (80,  "1 kg",      "India Gate Basmati"),
    "basmati rice":                 (120, "1 kg",      "India Gate Basmati"),
    "wheat flour":                  (60,  "1 kg",      "Aashirvaad Atta"),
    "atta":                         (60,  "1 kg",      "Aashirvaad Atta"),
    "all purpose flour":            (45,  "500 g",     "Pillsbury Maida"),
    "flour":                        (45,  "500 g",     "Pillsbury Maida"),
    "gram flour":                   (60,  "500 g",     "Tata Sampann Besan"),
    "besan":                        (60,  "500 g",     "Tata Sampann Besan"),
    "semolina":                     (40,  "500 g",     "MTR Rava"),
    "rice flour":                   (40,  "500 g",     "Eastern Rice Flour"),
    "corn flour":                   (50,  "500 g",     "Weikfield Cornflour"),
    "flattened rice":               (50,  "500 g",     "MTR Poha"),
    "puffed rice":                  (30,  "200 g",     "Haldirams Murmura"),
    "vermicelli":                   (40,  "200 g",     "Bambino Vermicelli"),
    "pasta":                        (80,  "500 g",     "Barilla Penne"),
    "noodles":                      (60,  "200 g",     "Maggi Noodles"),
    "bread":                        (45,  "400 g",     "Britannia Bread"),

    # ── Spice Powders ────────────────────────────────────────────
    "turmeric powder":              (30,  "100 g",     "Everest Haldi"),
    "turmeric":                     (30,  "100 g",     "Everest Haldi"),
    "red chilli powder":            (50,  "100 g",     "Everest Red Chilli"),
    "kashmiri red chilli powder":   (60,  "100 g",     "Everest Kashmiri Mirch"),
    "coriander powder":             (40,  "100 g",     "Everest Dhaniya"),
    "cumin powder":                 (50,  "100 g",     "Everest Jeera Powder"),
    "garam masala powder":          (60,  "100 g",     "Everest Garam Masala"),
    "garam masala":                 (60,  "100 g",     "Everest Garam Masala"),
    "chaat masala powder":          (50,  "100 g",     "MDH Chaat Masala"),
    "black pepper powder":          (80,  "50 g",      "Catch Black Pepper"),
    "cardamom powder":              (120, "50 g",      "Everest Elaichi Powder"),
    "cinnamon powder":              (60,  "50 g",      "Everest Dalchini"),
    "amchur":                       (50,  "50 g",      "Everest Amchur"),
    "dry mango powder":             (50,  "50 g",      "Everest Amchur"),
    "paprika powder":               (80,  "50 g",      "Catch Paprika"),
    "sambar powder":                (60,  "100 g",     "MTR Sambar Powder"),
    "rasam powder":                 (55,  "100 g",     "MTR Rasam Powder"),

    # ── Whole Spices ─────────────────────────────────────────────
    "cumin seeds":                  (60,  "100 g",     "Everest Jeera"),
    "cumin":                        (60,  "100 g",     "Everest Jeera"),
    "mustard seeds":                (40,  "100 g",     "Everest Rai"),
    "mustard":                      (40,  "100 g",     "Everest Rai"),
    "black peppercorns":            (90,  "50 g",      "Catch Black Pepper"),
    "fennel seeds":                 (50,  "50 g",      "Everest Saunf"),
    "carom seeds":                  (40,  "50 g",      "Everest Ajwain"),
    "cinnamon stick":               (50,  "50 g",      "Everest Dalchini"),
    "cloves":                       (80,  "25 g",      "Everest Laung"),
    "cardamom":                     (120, "25 g",      "Green Elaichi"),
    "bay leaf":                     (30,  "10 g",      "Everest Tej Patta"),
    "asafoetida":                   (50,  "25 g",      "Hing Compounded"),
    "saffron strands":              (100, "1 g",       "Kashmiri Saffron"),
    "star anise":                   (60,  "25 g",      "Everest Star Anise"),
    "fenugreek seeds":              (30,  "100 g",     "Everest Methi Dana"),
    "methi seeds":                  (30,  "100 g",     "Everest Methi Dana"),
    "poppy seeds":                  (80,  "50 g",      "Badshah Khus Khus"),
    "sesame seeds":                 (50,  "100 g",     "Catch Til"),
    "nigella seeds":                (50,  "50 g",      "Kalonji"),

    # ── Dried herbs ───────────────────────────────────────────────
    "kasuri methi":                 (40,  "25 g",      "Everest Kasuri Methi"),
    "dried fenugreek leaves":       (40,  "25 g",      "Everest Kasuri Methi"),
    "dried oregano":                (60,  "10 g",      "Keya Oregano"),
    "basil powder":                 (60,  "10 g",      "Keya Basil"),
    "thyme":                        (70,  "10 g",      "Keya Thyme"),
    "rosemary":                     (70,  "10 g",      "Keya Rosemary"),

    # ── Nuts & Dry fruits ─────────────────────────────────────────
    "cashew nuts":                  (180, "100 g",     "Happilo Cashews"),
    "peanuts":                      (50,  "200 g",     "Haldirams Peanuts"),
    "almonds":                      (200, "100 g",     "Nutraj Almonds"),
    "badam":                        (200, "100 g",     "Nutraj Almonds"),
    "pistachios":                   (250, "100 g",     "Nutraj Pistachios"),
    "raisins":                      (80,  "100 g",     "Nutraj Raisins"),
    "walnuts":                      (200, "100 g",     "Nutraj Walnuts"),
    "pine nuts":                    (250, "50 g",      "Urban Platter Pine Nuts"),
    "coconut milk":                 (70,  "200 ml",    "Dabur Coconut Milk"),
    "desiccated coconut":           (60,  "100 g",     "Urban Platter"),

    # ── Sauces, Pastes & Condiments ───────────────────────────────
    "tomato puree":                 (35,  "200 g",     "Del Monte"),
    "ginger garlic paste":          (40,  "200 g",     "Nilon's"),
    "tamarind paste":               (60,  "200 g",     "Tamicon"),
    "soy sauce":                    (80,  "200 ml",    "Ching's Soy Sauce"),
    "hot sauce":                    (80,  "200 ml",    "Frank's Hot Sauce"),
    "ketchup":                      (80,  "500 g",     "Kissan Ketchup"),
    "mayonnaise":                   (90,  "250 g",     "Hellmann's Mayo"),
    "vinegar":                      (60,  "500 ml",    "Heinz Vinegar"),
    "tahini":                       (200, "200 g",     "Urban Platter Tahini"),

    # ── Baking ───────────────────────────────────────────────────
    "baking powder":                (40,  "100 g",     "Weikfield Baking Powder"),
    "baking soda":                  (25,  "100 g",     "Eno / Weikfield"),
    "vanilla":                      (80,  "20 ml",     "Mccormick Vanilla"),
    "cocoa powder":                 (120, "100 g",     "Hershey's Cocoa"),
    "jaggery":                      (60,  "500 g",     "Organic Jaggery"),
    "caster sugar":                 (60,  "500 g",     "Tate & Lyle"),
    "brown sugar":                  (80,  "500 g",     "Natureland Organic"),
    "honey":                        (120, "250 g",     "Dabur Honey"),
    "powdered sugar":               (60,  "500 g",     "Uttam"),

    # ── Stock & Liquids ───────────────────────────────────────────
    "vegetable stock":              (60,  "1 L",       "Knorr Stock Cube"),
    "chicken stock":                (60,  "1 L",       "Knorr Stock Cube"),
    "rose water":                   (80,  "200 ml",    "Dabur Rooh Afza"),

    # ── Oils, Special ─────────────────────────────────────────────
    "sesame oil":                   (180, "200 ml",    "Idhayam Gingelly Oil"),
    "mustard oil":                  (160, "1 L",       "Patanjali Kachi Ghani"),
}


# ─────────────────────────────────────────────────────────────────
# CATEGORY FALLBACK SYSTEM
# If ingredient not in PRICES dict, detect category by keywords
# and assign a realistic price band
# ─────────────────────────────────────────────────────────────────
CATEGORY_RULES: list[tuple[list[str], int, str, str]] = [
    # (keywords_in_ingredient, price, unit, category_label)
    # Proteins — most expensive
    (["mutton", "lamb", "beef", "pork"],          450, "500 g",  "Meat"),
    (["chicken"],                                  200, "500 g",  "Poultry"),
    (["fish", "basa", "bhetki", "rohu", "hilsa"],  250, "500 g",  "Fish"),
    (["prawn", "shrimp", "crab", "squid", "clam"], 350, "250 g",  "Seafood"),
    (["egg"],                                       90, "12 pcs", "Eggs"),

    # Dairy
    (["cheese", "mozzarella", "parmesan"],         130, "200 g",  "Cheese"),
    (["paneer", "cottage cheese"],                  90, "200 g",  "Paneer"),
    (["cream", "crème"],                            65, "200 ml", "Cream"),
    (["milk", "buttermilk"],                        30, "500 ml", "Milk"),
    (["curd", "yogurt", "dahi"],                    45, "400 g",  "Curd"),
    (["butter", "ghee"],                           120, "200 g",  "Fat"),

    # Nuts & exotic
    (["saffron"],                                  100, "1 g",    "Saffron"),
    (["cashew", "pistachio", "walnut", "almond",
       "pecan", "hazelnut", "pine nut"],           200, "100 g",  "Nuts"),
    (["raisin", "apricot dried", "fig dried",
       "date", "prune"],                            90, "100 g",  "Dry Fruits"),

    # Vegetables — fresh
    (["broccoli", "asparagus", "zucchini",
       "artichoke", "leek"],                        60, "250 g",  "Exotic Veg"),
    (["mushroom"],                                  50, "200 g",  "Mushroom"),
    (["spinach", "palak", "saag", "kale",
       "methi leaves", "fenugreek leaves"],         25, "250 g",  "Leafy Greens"),
    (["potato", "aloo", "sweet potato"],            30, "500 g",  "Root Veg"),
    (["onion", "shallot", "spring onion"],          40, "500 g",  "Onion"),
    (["tomato", "cherry tomato"],                   35, "500 g",  "Tomato"),
    (["peas", "matar", "edamame"],                  40, "250 g",  "Peas"),
    (["coconut milk", "coconut cream"],             70, "200 ml", "Coconut Milk"),
    (["coconut"],                                   45, "1 pc",   "Coconut"),

    # Lentils & Pulses
    (["dal", "lentil", "chickpea", "chana",
       "rajma", "moong", "masoor", "urad",
       "kidney bean", "black bean"],               100, "500 g",  "Lentils"),

    # Grains
    (["rice", "basmati", "brown rice"],            100, "1 kg",   "Rice"),
    (["flour", "atta", "maida", "besan",
       "semolina", "suji", "rava"],                 55, "500 g",  "Flour"),
    (["oats", "quinoa", "millet",
       "foxtail", "ragi", "barley"],                90, "500 g",  "Healthy Grains"),
    (["bread", "pav", "roti", "naan", "pita"],      45, "400 g",  "Bread"),
    (["pasta", "spaghetti", "penne", "noodle"],     70, "500 g",  "Pasta"),

    # Spices — powders
    (["masala", "powder", "spice mix"],             55, "100 g",  "Spice Powder"),
    # Spices — whole
    (["seed", "seeds", "stick", "leaf",
       "leaves", "bark", "pod"],                    45, "50 g",   "Whole Spice"),

    # Condiments & sauces
    (["sauce", "paste", "puree", "ketchup",
       "chutney", "pickle"],                        80, "200 g",  "Sauce/Condiment"),
    (["oil", "ghee", "butter", "fat"],             150, "500 ml", "Oil/Fat"),

    # Baking
    (["baking", "yeast", "cocoa",
       "chocolate", "vanilla"],                     80, "100 g",  "Baking"),
    (["sugar", "jaggery", "honey", "syrup"],        60, "500 g",  "Sweetener"),

    # Herbs & aromatics
    (["herb", "leaves", "coriander",
       "mint", "basil", "parsley"],                 15, "1 bunch","Fresh Herb"),
    (["dried", "kasuri"],                           45, "25 g",   "Dried Herb"),
]


def get_price(ingredient: str) -> dict:
    """
    Look up price for a normalized ingredient string.

    Returns:
        {
            "ingredient": str,
            "price": int,          # INR
            "unit": str,           # e.g. "500 g"
            "brand": str,          # e.g. "Amul Paneer"
            "is_estimated": bool   # True = category fallback was used
        }
    """
    ing = ingredient.lower().strip()
    # Remove parenthetical aliases
    ing_clean = re.sub(r'\s*\([^)]*\)', '', ing).strip()

    # 1. Exact match
    if ing_clean in PRICES:
        price, unit, brand = PRICES[ing_clean]
        return _result(ingredient, price, unit, brand, False)

    # 2. Substring match against dict keys (longest key wins)
    best_key = None
    for key in sorted(PRICES.keys(), key=len, reverse=True):
        if key in ing_clean or ing_clean in key:
            best_key = key
            break
    if best_key:
        price, unit, brand = PRICES[best_key]
        return _result(ingredient, price, unit, brand, False)

    # 3. Category fallback
    for keywords, price, unit, category in CATEGORY_RULES:
        if any(kw in ing_clean for kw in keywords):
            return _result(ingredient, price, unit, f"~{category}", True)

    # 4. Last resort: generic grocery item
    return _result(ingredient, 50, "1 unit", "~Generic", True)


def _result(ingredient, price, unit, brand, estimated):
    return {
        "ingredient": ingredient,
        "price": price,
        "unit": unit,
        "brand": brand,
        "is_estimated": estimated,
    }


def price_missing_ingredients(missing: list[str]) -> dict:
    """
    Price a list of missing ingredients and return full breakdown + total.
    Skips free items (water, salt if already have it).
    """
    FREE_ITEMS = {"water", "salt", "tap water"}

    priced = []
    total = 0

    for ing in missing:
        if ing.strip().lower() in FREE_ITEMS:
            continue
        result = get_price(ing)
        priced.append(result)
        total += result["price"]

    return {
        "items": priced,
        "total_cost": total,
        "estimated": any(p["is_estimated"] for p in priced),
        "item_count": len(priced),
    }


# ── Demo ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    test_missing = [
        "coconut milk", "curry leaves", "kashmiri red chilli powder",
        "paneer", "garam masala powder", "water", "cashew nuts paste",
        "boneless chicken", "some exotic herb i never heard of",
        "dried fenugreek leaves", "green chillies", "turmeric powder",
    ]
    result = price_missing_ingredients(test_missing)
    print(f"{'Ingredient':<35} {'Price':>6}  {'Unit':<12} Brand")
    print("─" * 75)
    for item in result["items"]:
        est = "~" if item["is_estimated"] else " "
        print(f"{item['ingredient']:<35} {est}₹{item['price']:>4}  {item['unit']:<12} {item['brand']}")
    print("─" * 75)
    print(f"{'TOTAL ESTIMATED COST':>51}  ₹{result['total_cost']}")
    print(f"\n({'~' if result['estimated'] else 'exact'} pricing, {result['item_count']} items)")
