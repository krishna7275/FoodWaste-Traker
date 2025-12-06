import express from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/barcode/:code - Lookup barcode from Open Food Facts
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    if (!code || code.length < 8) {
      return res.status(400).json({ error: 'Invalid barcode format' });
    }

    // Call Open Food Facts API
    const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);

    if (response.data.status === 0) {
      return res.status(404).json({ 
        error: 'Product not found', 
        message: 'This barcode is not in our database. Please enter product details manually.' 
      });
    }

    const product = response.data.product;

    // Map category
    const categoryMap = {
      'beverages': 'Beverages',
      'dairy': 'Dairy',
      'meats': 'Meat',
      'vegetables': 'Vegetables',
      'fruits': 'Fruits',
      'snacks': 'Snacks',
      'frozen': 'Frozen',
      'bakery': 'Bakery'
    };

    let category = 'Other';
    const categories = product.categories_tags || [];
    
    for (const cat of categories) {
      const catLower = cat.toLowerCase();
      for (const [key, value] of Object.entries(categoryMap)) {
        if (catLower.includes(key)) {
          category = value;
          break;
        }
      }
      if (category !== 'Other') break;
    }

    // Extract relevant data
    const productData = {
      name: product.product_name || product.generic_name || 'Unknown Product',
      category,
      brand: product.brands || '',
      quantity: product.quantity || '',
      imageUrl: product.image_url || '',
      barcode: code
    };

    res.json({ 
      success: true, 
      product: productData,
      message: 'Product found! Please add expiry date manually.'
    });

  } catch (error) {
    console.error('Barcode lookup error:', error.message);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: 'This barcode is not in our database. Please enter product details manually.'
      });
    }

    res.status(500).json({ 
      error: 'Error looking up barcode',
      message: 'Unable to fetch product information. Please try again or enter details manually.'
    });
  }
});

export default router;