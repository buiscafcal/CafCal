import express from 'express';
import { query } from '../db/connection.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', verifyToken, async (req, res) => {
  try {
    const result = await query('SELECT is_premium, premium_expires_at FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    res.json({
      isPremium: user.is_premium,
      expiresAt: user.premium_expires_at,
    });
  } catch (error) {
    console.error('Get premium status error:', error);
    res.status(500).json({ error: 'Failed to get premium status' });
  }
});

router.post('/upgrade', verifyToken, async (req, res) => {
  try {
    const { planType } = req.body;
    const expiresAt = new Date();
    if (planType === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }
    const result = await query(
      'UPDATE users SET is_premium = true, premium_expires_at = $1 WHERE id = $2 RETURNING *',
      [expiresAt, req.user.id]
    );
    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        isPremium: user.is_premium,
        premiumExpiresAt: user.premium_expires_at,
      },
    });
  } catch (error) {
    console.error('Upgrade premium error:', error);
    res.status(500).json({ error: 'Failed to upgrade premium' });
  }
});

export default router;