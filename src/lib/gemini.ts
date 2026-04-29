// ============================================
// Gemini AI Client — Server-side only
// ============================================

import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const recipeResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    recipes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "Name of the dish" },
          cuisine: { type: SchemaType.STRING, description: "Cuisine type e.g. Indian, Italian" },
          cookTime: { type: SchemaType.STRING, description: "Total cook time e.g. 30 mins" },
          difficulty: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["Easy", "Medium", "Hard"],
            description: "Difficulty level",
          },
          servings: { type: SchemaType.INTEGER, description: "Number of servings" },
          description: { type: SchemaType.STRING, description: "Short 1-2 sentence description of the dish" },
          ingredients: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING, description: "Ingredient name" },
                quantity: { type: SchemaType.STRING, description: "Amount needed e.g. 200g, 2 tbsp" },
                available: {
                  type: SchemaType.BOOLEAN,
                  description: "true if this ingredient was provided by the user, false if it is additional/missing",
                },
              },
              required: ["name", "quantity", "available"],
            },
          },
          instructions: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Step-by-step cooking instructions",
          },
          nutrition: {
            type: SchemaType.OBJECT,
            properties: {
              calories: { type: SchemaType.INTEGER, description: "Approximate calories per serving" },
              protein: { type: SchemaType.STRING, description: "Protein amount e.g. 15g" },
              carbs: { type: SchemaType.STRING, description: "Carbs amount e.g. 30g" },
              fat: { type: SchemaType.STRING, description: "Fat amount e.g. 10g" },
            },
            required: ["calories", "protein", "carbs", "fat"],
          },
        },
        required: ["name", "cuisine", "cookTime", "difficulty", "servings", "description", "ingredients", "instructions", "nutrition"],
      },
    },
  },
  required: ["recipes"],
};

export async function generateRecipesStream(
  ingredients: string[],
  dietary: string[],
  allergies: string[],
  mealType: string
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: recipeResponseSchema,
    },
  });

  const dietaryText = dietary.length > 0 ? `Dietary preferences: ${dietary.join(", ")}.` : "";
  const allergyText = allergies.length > 0
    ? `CRITICAL ALLERGIES (HARD CONSTRAINT — never include these ingredients or any derivative): ${allergies.join(", ")}.`
    : "";
  const mealText = mealType && mealType !== "Any" ? `Meal type: ${mealType}.` : "";

  const prompt = `You are a culinary AI assistant for an Indian grocery delivery app. Given the user's available ingredients, suggest exactly 4 recipes.

AVAILABLE INGREDIENTS: ${ingredients.join(", ")}

${dietaryText}
${allergyText}
${mealText}

RULES:
1. Rank recipes by ingredient match — recipes using more of the provided ingredients should come first.
2. Bias toward Indian cuisine but include 1 global recipe if it fits well.
3. For each ingredient in the recipe, set "available" to true ONLY if the user provided it. All other ingredients must have "available" set to false.
4. Keep missing ingredients minimal (ideally 2-5 per recipe).
5. Include common Indian pantry staples (salt, oil, water) as available — assume the user has these.
6. Make instructions detailed and beginner-friendly.
7. Each recipe should be meaningfully different from the others.
8. Provide realistic nutritional estimates per serving.`;

  const result = await model.generateContentStream(prompt);
  return result.stream;
}
