const fs = require('fs');
const path = require('path');

const INDIAN_CSV = path.join(__dirname, 'Cleaned_Indian_Food_Dataset.csv');
const EPICURIOUS_CSV_ALT = path.join(__dirname, '../Food Ingredients and Recipe Dataset with Image Name Mapping.csv');
const OUTPUT_JSON = path.join(__dirname, 'recipes_unified.json');

const SUPABASE_BUCKET_URL = 'https://duxutcoohteuwwkgypky.supabase.co/storage/v1/object/public/epicurious-images/';

// Helper to parse CSV manually
function parseCSV(content) {
  const results = [];
  const lines = content.split('\n');
  const headers = lines[0].trim().split(',').map(h => h.trim().replace(/\r/, ''));
  
  let i = 1;
  while (i < lines.length) {
    let line = lines[i];
    if (!line.trim()) { i++; continue; }
    while ((line.match(/\"/g) || []).length % 2 !== 0 && i + 1 < lines.length) {
      i++; line += '\n' + lines[i];
    }
    const row = {};
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '\"') inQuotes = !inQuotes;
      else if (ch === ',' && !inQuotes) { fields.push(current); current = ''; }
      else current += ch;
    }
    fields.push(current);
    headers.forEach((h, idx) => row[h] = (fields[idx] || '').trim());
    results.push(row);
    i++;
  }
  return results;
}

// Generate a random ID
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Dietary Keywords
const nonVegKeywords = ['chicken', 'beef', 'pork', 'lamb', 'mutton', 'fish', 'prawn', 'shrimp', 'crab', 'squid', 'salmon', 'tuna', 'bacon', 'ham', 'turkey', 'meat', 'sausage', 'prosciutto', 'anchovy'];
const dairyKeywords = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'curd', 'paneer', 'ghee', 'whey', 'buttermilk'];
const eggKeywords = ['egg', 'eggs', 'mayonnaise'];
const honeyKeywords = ['honey'];
const glutenKeywords = ['wheat', 'flour', 'bread', 'pasta', 'atta', 'maida', 'suji', 'semolina', 'barley', 'rye', 'oats', 'noodle', 'macaroni', 'spaghetti'];
const nutKeywords = ['peanut', 'almond', 'cashew', 'walnut', 'pecan', 'macadamia', 'pistachio', 'hazelnut', 'pine nut'];

function cleanIngredientList(rawString) {
  if (!rawString) return [];
  // Some Kaggle CSVs use python list format strings like "['ingredient1', 'ingredient2']"
  if (rawString.startsWith('[')) {
    try {
      const parsed = JSON.parse(rawString.replace(/'/g, '"'));
      if (Array.isArray(parsed)) return parsed.map(i => i.toLowerCase().trim());
    } catch(e) { /* fall back */ }
  }
  return rawString.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
}

function processDietary(ingredients) {
  const allIngs = ingredients.join(' ');
  const hasWord = (wordList) => wordList.some(w => allIngs.includes(w));
  
  const hasMeat = hasWord(nonVegKeywords);
  const hasDairy = hasWord(dairyKeywords);
  const hasEgg = hasWord(eggKeywords);
  const hasHoney = hasWord(honeyKeywords);
  const hasGluten = hasWord(glutenKeywords);
  const hasNuts = hasWord(nutKeywords);
  
  const isVegetarian = !hasMeat;
  const isVegan = isVegetarian && !hasDairy && !hasEgg && !hasHoney;
  
  return {
    is_vegetarian: isVegetarian,
    is_vegan: isVegan,
    is_gluten_free: !hasGluten,
    is_dairy_free: !hasDairy,
    is_nut_free: !hasNuts,
    health_level: (hasMeat && hasDairy) ? 'indulgent' : isVegan ? 'healthy' : 'moderate' // basic heuristic
  };
}

function main() {
  console.log("Building Unified Dataset...");
  const unified = [];
  
  // 1. Parse Indian Dataset
  console.log("Loading Indian dataset...");
  const indianCsv = fs.readFileSync(INDIAN_CSV, 'utf8');
  const indianData = parseCSV(indianCsv);
  
  for (const row of indianData) {
    if (!row.TranslatedRecipeName) continue;
    const canIngs = cleanIngredientList(row['Cleaned-Ingredients']);
    const rawIngs = cleanIngredientList(row.TranslatedIngredients);
    const dietary = processDietary(canIngs);
    
    // Convert comma instructions into array
    const dirs = row.TranslatedInstructions.split(/\.\s+/).filter(s => s.length > 5).map(s => s.trim() + '.');
    
    unified.push({
      id: generateId(),
      recipe_title: row.TranslatedRecipeName,
      description: `A delicious ${row.Cuisine || 'Indian'} dish.`,
      source: 'indian',
      source_url: row.URL || '',
      image_url: row['image-url'] || '',
      ingredients_raw: rawIngs,
      ingredients_canonical: [...new Set(canIngs)], // deduplicate
      directions: dirs,
      num_ingredients: canIngs.length,
      total_time_min: parseInt(row.TotalTimeInMins) || 45,
      cuisine_list: ['Indian', row.Cuisine].filter(Boolean),
      primary_cuisine: 'Indian',
      course_list: ['Main'],
      ...dietary
    });
  }
  console.log(`Added ${indianData.length} Indian recipes.`);

  // 2. Parse Epicurious Dataset
  console.log("Loading Epicurious dataset...");
  let epicuriousCsv = fs.readFileSync(EPICURIOUS_CSV_ALT, 'utf8');
  
  const epiData = parseCSV(epicuriousCsv);
  for (const row of epiData) {
    if (!row.Title) continue;
    
    const canIngs = cleanIngredientList(row.Cleaned_Ingredients);
    let rawIngs = cleanIngredientList(row.Ingredients);
    // Fix common parsing issues with python lists
    rawIngs = rawIngs.map(i => i.replace(/^\[\'|\'\]$/g, '').replace(/^\'|\'$/g, ''));
    
    const dietary = processDietary(canIngs);
    const dirs = row.Instructions.split(/\.\s+/).filter(s => s.length > 5).map(s => s.trim() + '.');
    
    // The image names have to map to the Supabase URL we just uploaded to
    const imgName = row.Image_Name ? row.Image_Name.trim() + '.jpg' : '';
    const fullImgUrl = imgName ? SUPABASE_BUCKET_URL + encodeURIComponent(imgName) : '';
    
    unified.push({
      id: generateId(),
      recipe_title: row.Title,
      description: `A classic epicurious recipe.`,
      source: 'epicurious',
      source_url: '',
      image_url: fullImgUrl,
      ingredients_raw: rawIngs,
      ingredients_canonical: [...new Set(canIngs)],
      directions: dirs,
      num_ingredients: canIngs.length,
      total_time_min: 45, // default
      cuisine_list: ['Global'],
      primary_cuisine: 'Global', // we can refine this later
      course_list: ['Main'],
      ...dietary
    });
  }
  console.log(`Added ${epiData.length} Epicurious recipes.`);

  // 3. Save Unified JSON
  console.log(`Total Unified Recipes: ${unified.length}`);
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(unified, null, 2));
  console.log(`Successfully wrote to ${OUTPUT_JSON}`);
}

main();
