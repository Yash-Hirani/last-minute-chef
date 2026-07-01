const fs = require('fs');

console.log("Loading dataset...");
const data = JSON.parse(fs.readFileSync('../recipes_extended.json', 'utf8'));
console.log(`Original count: ${data.length}`);

// Clean cuisine names and specificity mapping
const cleanCuisineMap = {
  'american': 'American', 'american_region': 'American',
  'asian': 'Asian', 'chinese': 'Chinese', 'korean': 'Korean', 'japanese': 'Japanese',
  'thai': 'Thai', 'vietnamese': 'Vietnamese', 'filipino': 'Filipino',
  'european': 'European', 'french': 'French', 'italian': 'Italian', 'greek': 'Greek',
  'mediterranean': 'Mediterranean', 'german': 'German', 'british': 'British',
  'russian': 'Russian', 'spanish': 'Spanish', 'turkish': 'Turkish',
  'indian': 'Indian', 'middle eastern': 'Middle Eastern', 'middle eastern region': 'Middle Eastern',
  'caribbean': 'Caribbean', 'latin american': 'Latin American', 'mexican': 'Mexican',
  'african': 'African'
};

const specificityOrder = [
  'Indian', 'Thai', 'Korean', 'Chinese', 'Japanese', 'Vietnamese', 'Filipino',
  'Mexican', 'Italian', 'French', 'Greek', 'Spanish', 'German', 'British',
  'Turkish', 'Russian', 'Mediterranean', 'Middle Eastern', 'Caribbean',
  'Latin American', 'African', 'American', 'European', 'Asian'
];

const getPrimaryCuisine = (cuisines) => {
  if (!cuisines || cuisines.length === 0) return null;
  
  // Clean and deduplicate list
  const cleanTags = [...new Set(cuisines.map(c => cleanCuisineMap[c] || null).filter(Boolean))];
  if (cleanTags.length === 0) return null;

  // Find most specific
  for (const target of specificityOrder) {
    if (cleanTags.includes(target)) return target;
  }
  return cleanTags[0];
};

const sigs = new Set();
const cleanData = [];

for (const r of data) {
  // Prune outliers
  if (!r.ingredients_canonical || r.ingredients_canonical.length <= 1) continue;
  
  const totalTime = (r.est_prep_time_min || 0) + (r.est_cook_time_min || 0);
  if (totalTime > 300) continue;

  // Deduplicate canonical ingredients to fix React keys
  const uniqueIngs = [...new Set(r.ingredients_canonical)];
  
  // Exact dedup check
  const sig = r.recipe_title.toLowerCase().trim() + '|' + uniqueIngs.sort().join(',');
  if (sigs.has(sig)) continue;
  sigs.add(sig);

  // Compute new fields
  r.ingredients_canonical = uniqueIngs;
  r.total_time_min = totalTime;
  r.primary_cuisine = getPrimaryCuisine(r.cuisine_list);
  
  // Normalize course
  if (r.course_list) {
      r.course_list = r.course_list.filter(c => c !== 'unknown').map(c => c.charAt(0).toUpperCase() + c.slice(1));
  }
  if (!r.course_list || r.course_list.length === 0) r.course_list = ["Main"];

  // Drop recipes with empty cuisine after cleanup
  if (!r.primary_cuisine) continue;

  // Delete redundant fields
  delete r.ingredients_raw;
  delete r.directions_raw;
  delete r.combined_text;
  delete r.directions_text;
  delete r.fast_hits;
  delete r.slow_hits;
  delete r.medium_hits;
  delete r.main_ingredient;
  delete r.ingredient_text;

  cleanData.push(r);
}

console.log(`Cleaned count: ${cleanData.length}`);
console.log("Writing recipes_clean.json...");
fs.writeFileSync('recipes_clean.json', JSON.stringify(cleanData, null, 2));
console.log("Done!");
