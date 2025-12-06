import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { authMiddleware } from '../middleware/auth.js';
import { getOCRParsingPrompt } from '../utils/aiPrompts.js';

const router = express.Router();

// Initialize Anthropic client
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// All routes require authentication
router.use(authMiddleware);

// POST /api/ocr/parse - Parse OCR text to extract expiry date
router.post('/parse', async (req, res) => {
  try {
    const { ocrText } = req.body;

    if (!ocrText) {
      return res.status(400).json({ error: 'OCR text is required' });
    }

    // If no API key, return mock response
    if (!anthropic) {
      console.warn('⚠️  No Anthropic API key found. Using mock OCR parsing.');
      
      // Simple regex-based fallback
      const datePatterns = [
        /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/,  // DD/MM/YYYY or DD-MM-YYYY
        /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/,  // YYYY/MM/DD
        /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})/   // DD/MM/YY
      ];

      let extractedDate = null;
      
      for (const pattern of datePatterns) {
        const match = ocrText.match(pattern);
        if (match) {
          // Try to construct a valid date
          const parts = match.slice(1);
          if (parts[0].length === 4) {
            // YYYY-MM-DD format
            extractedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          } else {
            // Assume DD/MM/YYYY or DD/MM/YY
            const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            extractedDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
          break;
        }
      }

      return res.json({
        expiryDate: extractedDate,
        confidence: extractedDate ? 0.7 : 0,
        originalText: ocrText,
        method: 'regex_fallback'
      });
    }

    // Use Claude AI to parse the OCR text
    const prompt = getOCRParsingPrompt(ocrText);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;
    
    // Parse JSON response
    let parsedData;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: responseText
      });
    }

    res.json({
      expiryDate: parsedData.expiryDate,
      confidence: parsedData.confidence || 0.8,
      originalText: parsedData.originalText || ocrText,
      method: 'ai_powered'
    });

  } catch (error) {
    console.error('OCR parsing error:', error.message);
    res.status(500).json({ 
      error: 'Error parsing OCR text',
      message: error.message
    });
  }
});

export default router;