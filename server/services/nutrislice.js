import axios from 'axios';
import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

const NUTRISLICE_SCHOOLS = {
  'belleville-high-school': {
    domain: 'vanburenschools',
    schoolName: 'belleville-high-school',
    state: 'Michigan',
  },
};

export async function fetchNutrisliceMenu(schoolId) {
  try {
    const schoolConfig = NUTRISLICE_SCHOOLS[schoolId];
    if (!schoolConfig) {
      throw new Error('School not configured for Nutrislice');
    }
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const url = `https://${schoolConfig.domain}.api.nutrislice.com/menu/api/weeks/school/${schoolConfig.schoolName}/menu-type/lunch/${dateStr}/`;
    const response = await axios.get(url, { timeout: 10000 });
    const menuData = response.data;
    if (menuData && menuData.days && menuData.days.length > 0) {
      const foods = [];
      for (const day of menuData.days) {
        if (day.menu_stations) {
          for (const station of day.menu_stations) {
            for (const item of station.items || []) {
              foods.push({
                name: item.name,
                category: station.name,
                calories: item.nutrition?.calories || 0,
                protein: item.nutrition?.protein || 0,
                carbohydrates: item.nutrition?.carbohydrates || 0,
                fat: item.nutrition?.fat || 0,
                fiber: item.nutrition?.fiber || 0,
                sodium: item.nutrition?.sodium || 0,
                nutrisliceId: item.id,
              });
            }
          }
        }
      }
      for (const food of foods) {
        const existingFood = await query(
          'SELECT id FROM food_items WHERE nutrislice_id = $1 AND school_id = $2',
          [food.nutrisliceId, schoolId]
        );
        if (existingFood.rows.length === 0) {
          await query(
            `INSERT INTO food_items (id, school_id, name, category, calories, protein, carbohydrates, fat, fiber, sodium, nutrislice_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [uuidv4(), schoolId, food.name, food.category, food.calories, food.protein, food.carbohydrates, food.fat, food.fiber, food.sodium, food.nutrisliceId]
          );
        }
      }
      return foods;
    }
    return [];
  } catch (error) {
    console.error('Nutrislice fetch error:', error.message);
    return [];
  }
}