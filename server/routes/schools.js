import express from 'express';
import { query } from '../db/connection.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT id, name, state, district FROM schools ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ error: 'Failed to get schools' });
  }
});

router.post('/select', verifyToken, async (req, res) => {
  try {
    const { schoolId } = req.body;
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID is required' });
    }
    await query('UPDATE users SET school_id = $1 WHERE id = $2', [schoolId, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Select school error:', error);
    res.status(500).json({ error: 'Failed to select school' });
  }
});

export default router;