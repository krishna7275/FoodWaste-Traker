import express from 'express';
import Item from '../models/Item.js';
import Anthropic from '@anthropic-ai/sdk';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// POST /api/meal-planning/suggest - AI-powered meal planning
router.post('/suggest', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const userId = req.userId;

    // Get expiring items
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const expiringItems = await Item.find({
      userId,
      expiryDate: { $gte: now, $lte: futureDate },
      status: { $ne: 'consumed' }
    }).sort('expiryDate');

    if (expiringItems.length === 0) {
      return res.json({
        plan: [],
        message: 'No items expiring soon. Great job!'
      });
    }

    const ingredients = expiringItems.map(item => ({
      name: item.name,
      quantity: `${item.quantity} ${item.unit}`,
      category: item.category,
      daysUntilExpiry: Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24))
    }));

    // Use AI to generate meal plan
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return basic meal plan without AI
      return res.json({
        plan: generateBasicMealPlan(expiringItems),
        message: 'Basic meal plan generated'
      });
    }

    const anthropicClient = new Anthropic({ apiKey });
    const prompt = `Create a ${days}-day meal plan using these expiring ingredients. Prioritize items expiring soonest.

Ingredients:
${ingredients.map(ing => `- ${ing.name} (${ing.quantity}) - expires in ${ing.daysUntilExpiry} days`).join('\n')}

Return a JSON object with this structure:
{
  "plan": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "meals": {
        "breakfast": { "name": "...", "ingredients": [...], "time": "15 mins" },
        "lunch": { "name": "...", "ingredients": [...], "time": "30 mins" },
        "dinner": { "name": "...", "ingredients": [...], "time": "45 mins" }
      },
      "priorityItems": ["item1", "item2"]
    }
  ],
  "shoppingList": ["items needed to complete meals"],
  "tips": ["helpful tips for meal prep"]
}`;

    try {
      const message = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = message?.content?.[0]?.text || '';
      const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : cleaned;
      const parsed = JSON.parse(jsonStr);

      res.json({
        plan: parsed.plan || [],
        shoppingList: parsed.shoppingList || [],
        tips: parsed.tips || [],
        message: 'AI-generated meal plan'
      });
    } catch (aiError) {
      console.error('AI meal planning error:', aiError);
      res.json({
        plan: generateBasicMealPlan(expiringItems),
        message: 'Basic meal plan generated (AI unavailable)'
      });
    }
  } catch (error) {
    console.error('Meal planning error:', error);
    res.status(500).json({ error: 'Error generating meal plan' });
  }
});

function generateBasicMealPlan(items) {
  const plan = [];
  const sortedItems = [...items].sort((a, b) => 
    new Date(a.expiryDate) - new Date(b.expiryDate)
  );

  for (let i = 0; i < Math.min(7, sortedItems.length); i++) {
    const item = sortedItems[i];
    const date = new Date();
    date.setDate(date.getDate() + i);

    plan.push({
      day: i + 1,
      date: date.toISOString().split('T')[0],
      meals: {
        dinner: {
          name: `Recipe with ${item.name}`,
          ingredients: [item.name],
          time: '30 mins'
        }
      },
      priorityItems: [item.name]
    });
  }

  return plan;
}

export default router;

