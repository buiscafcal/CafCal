import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/daily/:date', verifyToken, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    let trackingResult = await query(
      'SELECT * FROM daily_tracking WHERE user_id = $1 AND tracking_date = $2',
      [userId, date]
    );
    let tracking;
    if (trackingResult.rows.length === 0) {
      const trackingId = uuidv4();
      await query(
        'INSERT INTO daily_tracking (id, user_id, tracking_date) VALUES ($1, $2, $3)',
        [trackingId, userId, date]
      );
      tracking = { id: trackingId, total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, total_fiber: 0 };
    } else {
      tracking = trackingResult.rows[0];
    }
    const logsResult = await query(
      `SELECT fl.*, fi.name, fi.category FROM food_logs fl
       JOIN daily_tracking dt ON fl.daily_tracking_id = dt.id
       JOIN food_items fi ON fl.food_item_id = fi.id
       WHERE dt.user_id = $1 AND dt.tracking_date = $2
       ORDER BY fl.created_at DESC`,
      [userId, date]
    );
    res.json({
      id: tracking.id,
      trackingDate: tracking.tracking_date,
      totalCalories: parseFloat(tracking.total_calories),
      totalProtein: parseFloat(tracking.total_protein),
      totalCarbs: parseFloat(tracking.total_carbs),
      totalFat: parseFloat(tracking.total_fat),
      totalFiber: parseFloat(tracking.total_fiber),
      foodLogs: logsResult.rows.map(log => ({
        id: log.id,
        name: log.name,
        category: log.category,
        mealType: log.meal_type,
        servingSize: parseFloat(log.serving_size),
        caloriesConsumed: parseFloat(log.calories_consumed),
        proteinConsumed: parseFloat(log.protein_consumed),
        carbsConsumed: parseFloat(log.carbs_consumed),
        fatConsumed: parseFloat(log.fat_consumed),
        fiberConsumed: parseFloat(log.fiber_consumed),
      })),
    });
  } catch (error) {
    console.error('Get daily tracking error:', error);
    res.status(500).json({ error: 'Failed to get daily tracking' });
  }
});

router.post('/log', verifyToken, async (req, res) => {
  try {
    const { foodItemId, mealType, servingSize, trackingDate } = req.body;
    const userId = req.user.id;
    if (!foodItemId || !mealType || !trackingDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const foodResult = await query('SELECT * FROM food_items WHERE id = $1', [foodItemId]);
    if (foodResult.rows.length === 0) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    const food = foodResult.rows[0];
    const serving = servingSize || 1;
    let trackingResult = await query(
      'SELECT * FROM daily_tracking WHERE user_id = $1 AND tracking_date = $2',
      [userId, trackingDate]
    );
    let trackingId;
    if (trackingResult.rows.length === 0) {
      trackingId = uuidv4();
      await query(
        'INSERT INTO daily_tracking (id, user_id, tracking_date) VALUES ($1, $2, $3)',
        [trackingId, userId, trackingDate]
      );
    } else {
      trackingId = trackingResult.rows[0].id;
    }
    const logId = uuidv4();
    const caloriesConsumed = parseFloat(food.calories) * serving;
    const proteinConsumed = parseFloat(food.protein) * serving;
    const carbsConsumed = parseFloat(food.carbohydrates) * serving;
    const fatConsumed = parseFloat(food.fat) * serving;
    const fiberConsumed = parseFloat(food.fiber) * serving;
    await query(
      `INSERT INTO food_logs (id, daily_tracking_id, food_item_id, meal_type, serving_size, calories_consumed, protein_consumed, carbs_consumed, fat_consumed, fiber_consumed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [logId, trackingId, foodItemId, mealType, serving, caloriesConsumed, proteinConsumed, carbsConsumed, fatConsumed, fiberConsumed]
    );
    await query(
      `UPDATE daily_tracking SET
       total_calories = total_calories + $1,
       total_protein = total_protein + $2,
       total_carbs = total_carbs + $3,
       total_fat = total_fat + $4,
       total_fiber = total_fiber + $5
       WHERE id = $6`,
      [caloriesConsumed, proteinConsumed, carbsConsumed, fatConsumed, fiberConsumed, trackingId]
    );
    res.status(201).json({ id: logId, success: true });
  } catch (error) {
    console.error('Log food error:', error);
    res.status(500).json({ error: 'Failed to log food' });
  }
});

router.delete('/log/:logId', verifyToken, async (req, res) => {
  try {
    const { logId } = req.params;
    const logResult = await query('SELECT * FROM food_logs WHERE id = $1', [logId]);
    if (logResult.rows.length === 0) {
      return res.status(404).json({ error: 'Food log not found' });
    }
    const log = logResult.rows[0];
    await query(
      `UPDATE daily_tracking SET
       total_calories = total_calories - $1,
       total_protein = total_protein - $2,
       total_carbs = total_carbs - $3,
       total_fat = total_fat - $4,
       total_fiber = total_fiber - $5
       WHERE id = $6`,
      [log.calories_consumed, log.protein_consumed, log.carbs_consumed, log.fat_consumed, log.fiber_consumed, log.daily_tracking_id]
    );
    await query('DELETE FROM food_logs WHERE id = $1', [logId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete food log error:', error);
    res.status(500).json({ error: 'Failed to delete food log' });
  }
});

export default router;