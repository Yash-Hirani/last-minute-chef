"""
Recipe Matching Engine v3 — Extended Global Dataset
=============================================
Uses recipes_extended.json (62k recipes).
TF-IDF is built on `ingredient_text`.
Ingredient matching uses `ingredients_canonical`.
Supports multiple new filters.
"""

import json
import re
import time
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ── Synonym map: user input → dataset vocabulary ──────────────
# We keep this because Indian users will still search "aloo", "paneer", etc.
SYNONYMS = {
    "cilantro": "coriander", "dhaniya": "coriander",
    "jeera": "cumin", "zeera": "cumin",
    "haldi": "turmeric",
    "hing": "asafoetida",
    "methi leaves": "fenugreek leaves",
    "methi": "fenugreek",
    "ajwain": "carom seeds",
    "dalchini": "cinnamon",
    "elaichi": "cardamom",
    "laung": "cloves",
    "kali mirch": "black pepper",
    "lal mirch": "red pepper",
    "mirch": "chili",
    "saunf": "fennel",
    "amchur": "dry mango",
    "kasuri methi": "dried fenugreek leaves",
    "baingan": "eggplant", "brinjal": "eggplant",
    "shimla mirch": "bell pepper", "capsicum": "bell pepper",
    "karela": "bitter gourd",
    "lauki": "bottle gourd",
    "bhindi": "okra",
    "matar": "peas",
    "palak": "spinach",
    "aloo": "potato",
    "gobi": "cauliflower",
    "gajar": "carrot",
    "pyaz": "onion",
    "tamatar": "tomato",
    "adrak": "ginger",
    "lahsun": "garlic",
    "nimbu": "lemon",
    "chana": "chickpeas", "chole": "chickpeas",
    "rajma": "kidney beans",
    "moong": "moong dal",
    "masoor": "red lentils",
    "dahi": "yogurt", "curd": "yogurt",
    "atta": "wheat flour",
    "maida": "all purpose flour",
    "besan": "gram flour",
    "suji": "semolina", "rava": "semolina",
    "poha": "flattened rice",
    "chawal": "rice",
    "nariyal": "coconut",
    "imli": "tamarind",
    "sarso": "mustard",
    "saag": "spinach",
    "kadhi": "yogurt",
}

def normalize_user_input(text: str) -> str:
    """Normalize ingredient typed by user — apply synonyms."""
    t = text.lower().strip()
    t = re.sub(r'^\d[\d\s./]*\s*(cup|tbsp|tsp|kg|g|ml|l|pieces?|nos?|handful)?\s*', '', t)
    for raw, mapped in sorted(SYNONYMS.items(), key=lambda x: -len(x[0])):
        t = re.sub(r'\b' + re.escape(raw) + r'\b', mapped, t)
    return t.strip()


class RecipeEngine:
    def __init__(self, json_path: str):
        t0 = time.time()
        print("Building recipe engine v3...")
        self.df = self._load_and_clean(json_path)
        self._build_tfidf_index()
        elapsed = round((time.time() - t0) * 1000)
        print(f"Ready — {len(self.df)} recipes indexed in {elapsed}ms")

    def _load_and_clean(self, path: str) -> pd.DataFrame:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        df = pd.DataFrame(data)
        
        # Ensure we have valid times
        df['total_time_min'] = df['total_time_min'].fillna(0)
        
        # Fill missing values
        df['ingredients_canonical'] = df['ingredients_canonical'].apply(lambda x: x if isinstance(x, list) else [])
        df['directions'] = df['directions'].apply(lambda x: x if isinstance(x, list) else [])
        
        # TF-IDF string for indexing
        df['ing_tfidf'] = df['ingredients_canonical'].apply(
            lambda ings: ' '.join([str(i).replace(' ', '_') for i in ings])
        )
        
        return df

    def _build_tfidf_index(self):
        self.vectorizer = TfidfVectorizer(
            analyzer='word',
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.90,
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['ing_tfidf'])

    def _match_ingredients(self, user_norm: list[str], recipe_ings: list[str]):
        """Score each recipe ingredient against the user's pantry."""
        available, missing = [], []
        for r_ing in recipe_ings:
            matched = False
            for u_ing in user_norm:
                if u_ing == r_ing:
                    matched = True; break
                if len(u_ing) > 3 and (u_ing in r_ing or r_ing in u_ing):
                    matched = True; break
                r_words = set(r_ing.split())
                u_words = set(u_ing.split())
                if any(len(w) > 3 for w in (r_words & u_words)):
                    matched = True; break
            (available if matched else missing).append(r_ing)
        return available, missing

    def search(
        self,
        user_ingredients: list[str],
        top_n: int = 4,
        max_missing: int = 5,
        cuisine_filter: str = None,
        course_filter: str = None,
        taste_filter: str = None,
        health_level_filter: str = None,
        max_time_mins: int = None,
        vegetarian_only: bool = False,
        vegan_only: bool = False,
        halal: bool = False,
        kosher: bool = False,
        nut_free: bool = False,
        dairy_free: bool = False,
        gluten_free: bool = False,
    ) -> list[dict]:
        user_norm = [normalize_user_input(i) for i in user_ingredients]
        user_tfidf_str = ' '.join([i.replace(' ', '_') for i in user_norm])

        # TF-IDF cosine similarity
        user_vec = self.vectorizer.transform([user_tfidf_str])
        scores = cosine_similarity(user_vec, self.tfidf_matrix).flatten()

        pool_size = top_n * 50
        candidates = scores.argsort()[::-1][:pool_size]

        results = []
        for idx in candidates:
            row = self.df.iloc[idx]

            # Filters
            if cuisine_filter and cuisine_filter.lower() != "any":
                cuisines = [c.lower() for c in (row.get('cuisine_list') or [])]
                if cuisine_filter.lower() not in cuisines:
                    continue
            
            if course_filter and course_filter.lower() != "any":
                courses = [c.lower() for c in (row.get('course_list') or [])]
                if course_filter.lower() not in courses:
                    continue
            
            if taste_filter and taste_filter.lower() != "any":
                if row.get('primary_taste') != taste_filter.lower():
                    continue

            if health_level_filter and health_level_filter.lower() != "any":
                if row.get('health_level') != health_level_filter.lower():
                    continue

            if max_time_mins and row.get('total_time_min', 0) > max_time_mins:
                continue

            if vegetarian_only and not row.get('is_vegetarian'):
                continue
            if vegan_only and not row.get('is_vegan'):
                continue
            if halal and not row.get('is_halal'):
                continue
            if kosher and not row.get('is_kosher'):
                continue
            if nut_free and not row.get('is_nut_free'):
                continue
            if dairy_free and not row.get('is_dairy_free'):
                continue
            if gluten_free and not row.get('is_gluten_free'):
                continue

            available, missing = self._match_ingredients(user_norm, row['ingredients_canonical'])
            if len(missing) > max_missing:
                continue

            total = len(row['ingredients_canonical'])
            match_pct = round(len(available) / total * 100) if total else 0
            
            # Format instructions from list to a string
            instructions = " ".join(row['directions']) if isinstance(row['directions'], list) else str(row['directions'])
            
            # Use primary_cuisine for display
            cuisine_disp = row.get('primary_cuisine', 'Global')

            results.append({
                'name': row['recipe_title'],
                'cuisine': cuisine_disp,
                'time_mins': int(row['total_time_min']),
                'match_pct': match_pct,
                'tfidf_score': round(float(scores[idx]), 4),
                'total_ingredients': total,
                'available_ingredients': available,
                'missing_ingredients': missing,
                'missing_count': len(missing),
                'instructions': instructions,
                'image_url': '', # Extended dataset doesn't have image-url
                'source_url': '',
                # New fields
                'description': str(row.get('description', '')),
                'taste': str(row.get('primary_taste', '')),
                'health_level': str(row.get('health_level', '')),
                'cook_speed': str(row.get('cook_speed', '')),
                'difficulty': str(row.get('difficulty', '')),
                'course': (row.get('course_list') or ['Unknown'])[0].title()
            })
            if len(results) >= top_n:
                break

        results.sort(key=lambda r: (r['match_pct'], r['tfidf_score']), reverse=True)
        return results

    def search_json(self, user_ingredients: list[str], **kwargs) -> str:
        return json.dumps(self.search(user_ingredients, **kwargs), ensure_ascii=False, indent=2)

if __name__ == "__main__":
    engine = RecipeEngine('recipes_extended.json')
    res = engine.search(["chicken", "garlic", "tomato"], top_n=2)
    print(json.dumps(res, indent=2))
