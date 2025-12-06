import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { authMiddleware } from '../middleware/auth.js';
import { getRecipeGenerationPrompt } from '../utils/aiPrompts.js';

const router = express.Router();

// Initialize Anthropic client (optional)
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// All routes require authentication
router.use(authMiddleware);

// POST /api/recipes - Generate recipes from ingredients
router.post('/', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }

    // If no Anthropic key, return a simple mock response
    if (!anthropic) {
      console.warn('⚠️  No Anthropic API key found. Returning mock recipes.');

      const mock = ingredients.slice(0, 5);
      const recipes = [1,2,3].map((i) => ({
        title: `Quick Waste-Reducing Recipe ${i}`,
        time_mins: 20 + i * 5,
        difficulty: i === 1 ? 'Easy' : i === 2 ? 'Medium' : 'Easy',
        ingredients: mock.map((ing, idx) => `${idx+1} x ${ing}`),
        steps: [`Mix ${mock.join(', ')}`, 'Cook until ready', 'Serve hot'],
        uses: mock,
        waste_reduction_score: Math.round((mock.length / ingredients.length) * 100)
      }));

      return res.json({ recipes });
    }

    // Use AI to generate recipes
    const prompt = getRecipeGenerationPrompt(ingredients);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;
    // Debug: log raw AI response to help diagnose repeated outputs
    console.debug('Recipes AI raw response:', responseText);

    // Parse JSON response from the model
    let parsed;
    try {
      const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse recipe AI response:', parseErr);
      return res.status(500).json({ error: 'Failed to parse AI response', rawResponse: responseText });
    }

    // Ensure expected structure
    if (!parsed.recipes || !Array.isArray(parsed.recipes)) {
      return res.status(500).json({ error: 'AI returned unexpected format', rawResponse: parsed });
    }

    res.json({ recipes: parsed.recipes });
  } catch (error) {
    console.error('Recipe generation error:', error.message || error);
    res.status(500).json({ error: 'Error generating recipes', message: error.message });
  }
});

export default router;