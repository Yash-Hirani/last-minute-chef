const fs = require('fs');

const pyCode = fs.readFileSync('ingredient_pricer.py', 'utf8');

const catalog = [];
const pricesMatch = pyCode.match(/PRICES: dict\[str, tuple\[int, str, str\]\] = \{([\s\S]*?)\}/);

if (pricesMatch) {
  const dictStr = pricesMatch[1];
  const lines = dictStr.split('\n');
  
  for (const line of lines) {
    const m = line.match(/"([^"]+)":\s*\(\s*(\d+)/);
    if (m) {
      const name = m[1];
      const price = parseInt(m[2]);
      
      let cat = 'Pantry Staples';
      if (name.match(/chicken|mutton|lamb|beef|pork/)) cat = 'Meat & Poultry';
      else if (name.match(/fish|prawn|shrimp|crab/)) cat = 'Seafood';
      else if (name.match(/egg/)) cat = 'Eggs';
      else if (name.match(/cheese|paneer|cream|milk|curd|yogurt|butter|ghee/)) cat = 'Dairy';
      else if (name.match(/cashew|pistachio|walnut|almond|raisin|pine nut/)) cat = 'Nuts & Dry Fruits';
      else if (name.match(/spinach|palak|potato|onion|tomato|peas|mushroom|coconut/)) cat = 'Vegetables';
      else if (name.match(/dal|chickpea|rajma|moong|masoor/)) cat = 'Lentils & Dal';
      else if (name.match(/rice|flour|atta|maida|besan|pasta|bread/)) cat = 'Grains';
      else if (name.match(/powder|masala|seed|clove|cardamom|cinnamon/)) cat = 'Spices & Masalas';
      
      catalog.push({
        name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        category: cat,
        priceHint: price,
        searchKey: name
      });
    }
  }
}

const outStr = `// Auto-generated from ingredient_pricer.py PRICES
export interface CatalogIngredient {
  name: string;
  category: string;
  priceHint: number;
  searchKey: string;
}

export const INGREDIENT_CATALOG: CatalogIngredient[] = ${JSON.stringify(catalog, null, 2)};
`;

fs.writeFileSync('../src/lib/ingredients.ts', outStr);
console.log('done, extracted', catalog.length, 'items');
