export const getRecipeGenerationPrompt = (ingredients) => {
  return `Create 3 quick recipes using these ingredients: ${ingredients.join(", ")}

Return ONLY this exact JSON format, no markdown or extra text:
{"recipes":[{"title":"Recipe 1","time_mins":20,"difficulty":"Easy","ingredients":["ingredient1 measurement","ingredient2 measurement"],"steps":["Heat pan","Add ingredients","Cook 5 minutes","Serve"],"uses":["ingredient1","ingredient2"],"waste_reduction_score":80},{"title":"Recipe 2","time_mins":15,"difficulty":"Easy","ingredients":["ingredient1 measurement"],"steps":["Prepare","Cook","Serve"],"uses":["ingredient1"],"waste_reduction_score":75},{"title":"Recipe 3","time_mins":25,"difficulty":"Medium","ingredients":["ingredient1 measurement"],"steps":["Mix","Cook","Finish","Plate"],"uses":["ingredient1"],"waste_reduction_score":85}]}

Make each recipe different. Keep steps short.`;
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