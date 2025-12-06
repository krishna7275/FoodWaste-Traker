export const getRecipeGenerationPrompt = (ingredients) => {
  return `You are a professional chef AI assistant specializing in reducing food waste and creating quick, practical recipes.

TASK: Generate 3 quick, practical recipes using the provided ingredients that are about to expire.

INGREDIENTS PROVIDED: ${ingredients.join(", ")}

REQUIREMENTS:
- Prioritize recipes that use the MOST of the provided ingredients
- Keep recipes simple and quick (under 30 minutes)
- Include exact measurements for all ingredients
- You may add common pantry staples (salt, oil, spices, etc.) if needed
- Make recipes practical for home cooking
- Focus on minimizing food waste by using as many provided ingredients as possible

OUTPUT FORMAT:
Respond ONLY with valid JSON (no markdown, no code blocks, no explanations). Use this exact structure:

{
  "recipes": [
    {
      "title": "Descriptive Recipe Name",
      "time_mins": 20,
      "difficulty": "Easy",
      "ingredients": ["1 cup milk", "2 eggs", "1 slice bread"],
      "steps": ["Step 1 with details...", "Step 2 with details...", "Step 3 with details..."],
      "uses": ["milk", "eggs", "bread"],
      "waste_reduction_score": 85
    }
  ]
}

The waste_reduction_score should be 0-100 based on how many provided ingredients are used.

Generate 3 diverse recipes now:`;
};

export const getOCRParsingPrompt = (ocrText) => {
  return `Extract the expiry date from this OCR text: "${ocrText}"

COMMON FORMATS TO LOOK FOR:
- "EXP: DD/MM/YYYY" or "EXP DD-MM-YYYY"
- "Best Before: DD/MM/YYYY" or "BB: DD/MM/YYYY"
- "Use By: DD/MM/YYYY" or "UB: DD/MM/YYYY"
- "Expiry Date: DD/MM/YYYY"
- Any date near words like "exp", "expiry", "best before", "use by"

TASK:
1. Find the expiry date in the text
2. Convert it to YYYY-MM-DD format
3. Estimate confidence (0.0 to 1.0)

RESPOND ONLY WITH VALID JSON (no markdown, no explanations):
{
  "expiryDate": "YYYY-MM-DD",
  "confidence": 0.95,
  "originalText": "the exact text you extracted"
}

If no valid date is found, set expiryDate to null and confidence to 0.

Extract the date now:`;
};

export const getIngredientSuggestionPrompt = (partialName) => {
  return `Given the partial ingredient name "${partialName}", suggest 5 most likely complete ingredient names.

RESPOND ONLY WITH VALID JSON:
{
  "suggestions": ["complete name 1", "complete name 2", "complete name 3", "complete name 4", "complete name 5"]
}`;
};  