import { generateRecipesStream } from "./src/lib/gemini";
async function run() {
  try {
    const stream = await generateRecipesStream(["salt"], [], [], "Any");
    console.log("Stream generated");
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
