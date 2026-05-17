import express from 'express';
import { query } from '../db/connection.js';
import { verifyToken } from '../middleware/auth.js';
import { fetchNutrisliceMenu } from '../services/nutrislice.js';

const router = express.Router();

router.get('/school/:schoolId', verifyToken, async (req, res) => {
  try {
    const { schoolId } = req.params;
    let result = await query(
      'SELECT id, name, category, calories, protein, carbohydrates, fat, fiber, serving_size FROM food_items WHERE school_id = $1 ORDER BY name',
      [schoolId]
    );
    if (result.rows.length === 0) {
      await fetchNutrisliceMenu(schoolId);
      result = await query(
        'SELECT id, name, category, calories, protein, carbohydrates, fat, fiber, serving_size FROM food_items WHERE school_id = $1 ORDER BY name',
        [schoolId]
      );
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({ error: 'Failed to get foods' });
  }
});

router.get('/search/:schoolId', verifyToken, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    const result = await query(
      'SELECT id, name, category, calories, protein, carbohydrates, fat, fiber, serving_size FROM food_items WHERE school_id = $1 AND name ILIKE $2 ORDER BY name',
      [schoolId, `%${q}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;