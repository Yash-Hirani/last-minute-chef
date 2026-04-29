"""
Recipe Matching Engine v2 — Production Ready
=============================================
Fixes over v1:
- Strip parenthetical aliases from dataset: "potato (aloo)" → "potato"
- Fix synonym double-application: "turmeric powder" no longer becomes "turmeric powder powder"
- vegetarian filter fixed (was leaking mutton through word boundary bug)
- Better match % for Hindi inputs
"""

import pandas as pd
import json
import re
import time
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ── Synonym map: user input → dataset vocabulary ──────────────
SYNONYMS = {
    "cilantro": "coriander", "dhaniya": "coriander",
    "jeera": "cumin seeds", "zeera": "cumin seeds",
    "haldi": "turmeric powder",                         # direct to final form
    "hing": "asafoetida",
    "methi leaves": "fenugreek leaves",
    "methi": "fenugreek",
    "ajwain": "carom seeds",
    "dalchini": "cinnamon powder",
    "elaichi": "cardamom",
    "laung": "cloves",
    "kali mirch": "black pepper",
    "lal mirch": "red chilli powder",
    "mirch": "chilli",
    "saunf": "fennel seeds",
    "amchur": "dry mango powder",
    "kasuri methi": "dried fenugreek leaves",
    "garam masala": "garam masala powder",
    "baingan": "eggplant", "brinjal": "eggplant",
    "shimla mirch": "capsicum",
    "karela": "bitter gourd",
    "lauki": "bottle gourd",
    "bhindi": "okra",
    "matar": "green peas",
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
    "kadhi": "curd",
}

MEAT_KEYWORDS = frozenset([
    'chicken', 'mutton', 'lamb', 'beef', 'pork', 'fish',
    'prawn', 'shrimp', 'egg', 'eggs', 'seafood', 'meat', 'crab', 'squid'
])


def normalize_user_input(text: str) -> str:
    """Normalize ingredient typed by user — apply synonyms."""
    t = text.lower().strip()
    # Strip accidental quantities
    t = re.sub(r'^\d[\d\s./]*\s*(cup|tbsp|tsp|kg|g|ml|l|pieces?|nos?|handful)?\s*', '', t)
    # Apply synonyms (longest key first to avoid partial replacements)
    for raw, mapped in sorted(SYNONYMS.items(), key=lambda x: -len(x[0])):
        # Word-boundary aware replacement
        t = re.sub(r'\b' + re.escape(raw) + r'\b', mapped, t)
    return t.strip()


def normalize_dataset_ingredient(text: str) -> str:
    """
    Normalize a dataset ingredient.
    Strips parenthetical aliases: "potato (aloo) pressure" → "potato"
    Does NOT apply synonyms (dataset is already in English).
    """
    t = text.lower().strip()
    t = re.sub(r'\s*\([^)]*\)', '', t)   # remove "(aloo)", "(jeera)", etc.
    t = re.sub(r'\s+', ' ', t).strip()
    return t


class RecipeEngine:
    def __init__(self, csv_path: str):
        t0 = time.time()
        print("Building recipe engine...")
        self.df = self._load_and_clean(csv_path)
        self._build_tfidf_index()
        elapsed = round((time.time() - t0) * 1000)
        print(f"Ready — {len(self.df)} recipes indexed in {elapsed}ms")

    def _load_and_clean(self, path: str) -> pd.DataFrame:
        df = pd.read_csv(path)
        df = df.dropna(subset=['Cleaned-Ingredients', 'TranslatedRecipeName'])
        df = df[(df['TotalTimeInMins'] > 0) & (df['TotalTimeInMins'] <= 300)]
        df = df.reset_index(drop=True)

        # Parse + normalize dataset ingredients (strip parens, no synonym mapping)
        df['ing_list'] = df['Cleaned-Ingredients'].apply(
            lambda x: [normalize_dataset_ingredient(i) for i in x.split(',') if i.strip()]
        )

        # TF-IDF string for indexing
        df['ing_tfidf'] = df['ing_list'].apply(
            lambda ings: ' '.join([i.replace(' ', '_') for i in ings])
        )

        # Vegetarian flag
        df['is_veg'] = df['ing_list'].apply(
            lambda ings: not any(
                any(m == word for word in ing.split())
                for ing in ings for m in MEAT_KEYWORDS
            )
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
                # Word-level overlap for compounds ("cumin seeds" ↔ "cumin")
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
        max_time_mins: int = None,
        vegetarian_only: bool = False,
    ) -> list[dict]:
        # Normalize user input (apply synonyms)
        user_norm = [normalize_user_input(i) for i in user_ingredients]
        user_tfidf_str = ' '.join([i.replace(' ', '_') for i in user_norm])

        # TF-IDF cosine similarity
        user_vec = self.vectorizer.transform([user_tfidf_str])
        scores = cosine_similarity(user_vec, self.tfidf_matrix).flatten()

        # Larger pool when filters reduce candidates
        pool_size = top_n * 30 if (cuisine_filter or max_time_mins or vegetarian_only) else top_n * 8
        candidates = scores.argsort()[::-1][:pool_size]

        results = []
        for idx in candidates:
            row = self.df.iloc[idx]

            if cuisine_filter and cuisine_filter.lower() not in row['Cuisine'].lower():
                continue
            if max_time_mins and row['TotalTimeInMins'] > max_time_mins:
                continue
            if vegetarian_only and not row['is_veg']:
                continue

            available, missing = self._match_ingredients(user_norm, row['ing_list'])
            if len(missing) > max_missing:
                continue

            total = len(row['ing_list'])
            match_pct = round(len(available) / total * 100) if total else 0

            results.append({
                'name': row['TranslatedRecipeName'],
                'cuisine': row['Cuisine'],
                'time_mins': int(row['TotalTimeInMins']),
                'match_pct': match_pct,
                'tfidf_score': round(float(scores[idx]), 4),
                'total_ingredients': total,
                'available_ingredients': available,
                'missing_ingredients': missing,
                'missing_count': len(missing),
                'instructions': row['TranslatedInstructions'],
                'image_url': row['image-url'],
                'source_url': row['URL'],
            })
            if len(results) >= top_n:
                break

        results.sort(key=lambda r: (r['match_pct'], r['tfidf_score']), reverse=True)
        return results

    def search_json(self, user_ingredients: list[str], **kwargs) -> str:
        """JSON output for Node.js subprocess calls."""
        return json.dumps(self.search(user_ingredients, **kwargs), ensure_ascii=False, indent=2)


if __name__ == "__main__":
    engine = RecipeEngine('/mnt/user-data/uploads/Cleaned_Indian_Food_Dataset.csv')

    tests = [
        ("Basic pantry", ["onion","tomato","garlic","ginger","cumin","turmeric","oil","salt"], {"max_missing": 4}),
        ("Hindi names",  ["aloo","palak","jeera","haldi","dahi","lahsun","pyaz"],              {"max_missing": 4}),
        ("South Indian chicken <60m", ["chicken","onion","tomato","ginger","garlic","oil","salt","garam masala"],
                                      {"max_missing":5,"cuisine_filter":"South Indian","max_time_mins":60}),
        ("Quick veg paneer <30m",     ["paneer","onion","tomato","ginger","garlic","cream","salt","oil"],
                                      {"max_missing":4,"max_time_mins":30,"vegetarian_only":True}),
        ("Minimal 5 items",           ["dal","onion","tomato","turmeric","salt"], {"max_missing":4}),
    ]

    for label, ings, opts in tests:
        print(f"\n{'='*60}")
        print(f"TEST: {label}")
        print(f"USER HAS: {ings}")
        print('='*60)
        t0 = time.time()
        results = engine.search(ings, top_n=4, **opts)
        ms = round((time.time() - t0) * 1000, 1)
        if not results:
            print("  No results (try relaxing filters)")
        for i, r in enumerate(results, 1):
            print(f"  #{i} {r['name']}  [{r['cuisine']}] {r['time_mins']}m")
            print(f"      Match: {r['match_pct']}%  ({len(r['available_ingredients'])}/{r['total_ingredients']})")
            print(f"      Have:  {', '.join(r['available_ingredients'][:5])}{'...' if len(r['available_ingredients'])>5 else ''}")
            if r['missing_ingredients']:
                print(f"      Need:  {', '.join(r['missing_ingredients'])}")
        print(f"  ⚡ {ms}ms")
