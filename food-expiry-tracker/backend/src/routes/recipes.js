import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { authMiddleware } from '../middleware/auth.js';
import { getRecipeGenerationPrompt } from '../utils/aiPrompts.js';

const router = express.Router();

// NOTE: Do NOT initialize Anthropic client at module import time.
// dotenv is loaded in `server.js`, but ES module imports are evaluated
// before that code runs which can make `process.env` appear empty.
// Initialize the client inside the request handler to read current env.

// TEST ROUTE (no auth) - Remove in production
router.post('/test', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const anthropicClient = apiKey ? new Anthropic({ apiKey }) : null;
    
    if (apiKey) {
      const masked = apiKey.length > 8 ? `${apiKey.slice(0, 6)}...${apiKey.slice(-2)}` : '***';
      console.log('[TEST] API key present (masked):', masked);
    } else {
      console.log('[TEST] API key not present');
    }

    if (!anthropicClient) {
      console.warn('[TEST] ⚠️  No API key. Returning mock recipes.');
      const mock = ingredients.slice(0, 5);
      const recipes = [1, 2, 3].map((i) => ({
        title: `Recipe ${i}`,
        time_mins: 20 + i * 5,
        difficulty: i === 1 ? 'Easy' : 'Medium',
        ingredients: mock.map((ing, idx) => `${idx + 1} x ${ing}`),
        steps: [`Mix`, `Cook`, `Serve`],
        uses: mock,
        waste_reduction_score: 80
      }));
      return res.json({ recipes });
    }

    const prompt = getRecipeGenerationPrompt(ingredients);
    const temperature = Number(process.env.AI_TEMPERATURE) || 0.7;
    
    let message;
    try {
      message = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 700,
        temperature,
        messages: [{ role: 'user', content: prompt }]
      });
    } catch (apiErr) {
      console.error('[TEST] API call failed:', apiErr.message);
      return res.status(502).json({ error: 'API error', message: apiErr.message });
    }

    const responseText = message?.content?.[0]?.text || '';
    console.log('[TEST] Raw AI response length:', responseText.length);
    
    let parsed;
    try {
      // Remove markdown code blocks
      const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
      // Try to extract JSON object if there's extra text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : cleaned;
      
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('[TEST] Parse failed:', parseErr.message);
      console.error('[TEST] Raw response (first 500 chars):', responseText.substring(0, 500));
      return res.status(500).json({ error: 'Parse error', message: parseErr.message });
    }

    if (!parsed.recipes || !Array.isArray(parsed.recipes)) {
      return res.status(500).json({ error: 'Bad format' });
    }

    res.json({ recipes: parsed.recipes });
  } catch (error) {
    console.error('[TEST] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// All routes require authentication
router.use(authMiddleware);

// POST /api/recipes - Generate recipes from ingredients
router.post('/', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }

    // Initialize Anthropic client at request time so dotenv-loaded
    // environment variables are available even when modules were
    // imported before dotenv ran.
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const anthropicClient = apiKey ? new Anthropic({ apiKey }) : null;
    // Log masked API key presence for debugging
    if (apiKey) {
      const masked = apiKey.length > 8 ? `${apiKey.slice(0,6)}...${apiKey.slice(-2)}` : '***';
      console.log('Anthropic API key present (masked):', masked);
    } else {
      console.log('Anthropic API key not present at request time');
    }

    // If no Anthropic key, return a simple mock response
    if (!anthropicClient) {
      console.warn('⚠️  No Anthropic API key found. Returning mock recipes.');

      const mock = ingredients.slice(0, 5);
      const recipes = [1, 2, 3].map((i) => ({
        title: `Quick Waste-Reducing Recipe ${i}`,
        time_mins: 20 + i * 5,
        difficulty: i === 1 ? 'Easy' : i === 2 ? 'Medium' : 'Easy',
        ingredients: mock.map((ing, idx) => `${idx + 1} x ${ing}`),
        steps: [`Mix ${mock.join(', ')}`, 'Cook until ready', 'Serve hot'],
        uses: mock,
        waste_reduction_score: Math.round((mock.length / ingredients.length) * 100)
      }));

      return res.json({ recipes });
    }

    // Use AI to generate recipes
    const prompt = getRecipeGenerationPrompt(ingredients);

    // Use temperature for more variety (default 0.7)
    const temperature = Number(process.env.AI_TEMPERATURE) || 0.7;
    let message;
    try {
      message = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 700,
        temperature,
        messages: [{ role: 'user', content: prompt }]
      });
    } catch (apiErr) {
      console.error('Anthropic API call failed:', apiErr);
      const details = {};
      if (apiErr.response) {
        details.status = apiErr.response.status;
        details.data = apiErr.response.data;
      }
      return res.status(502).json({ error: 'Anthropic API error', details });
    }

    const responseText = message?.content?.[0]?.text || '';
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