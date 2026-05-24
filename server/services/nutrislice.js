import axios from 'axios';
import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export async function fetchNutrisliceMenu(schoolId) {
  try {
    // Get school config from database
    const schoolResult = await query(
      'SELECT * FROM schools WHERE id = $1',
      [schoolId]
    );
    
    if (schoolResult.rows.length === 0) {
      throw new Error('School not found');
    }

    const school = schoolResult.rows[0];
    
    if (!school.nutrislice_domain) {
      throw new Error('School not configured for Nutrislice');
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const url = `https://${school.nutrislice_domain}.api.nutrislice.com/menu/api/weeks/school/${school.name.toLowerCase().replace(/\s+/g, '-')}/menu-type/lunch/${dateStr}/`;
    
    console.log(`Fetching Nutrislice URL: ${url}`);
    
    const response = await axios.get(url, { timeout: 10000 });
    const menuData = response.data;

    if (menuData && menuData.days && menuData.days.length > 0) {
      const foods = [];
      for (const day of menuData.days) {
        if (day.menu_stations) {
          for (const station of day.menu_stations) {
            for (const item of station.items || []) {
              if (item.food && item.food.name) {
                foods.push({
                  name: item.food.name,
                  category: station.name,
                  calories: item.food.rounded_nutrition_info?.calories || 0,
                  protein: item.food.rounded_nutrition_info?.g_protein || 0,
                  carbohydrates: item.food.rounded_nutrition_info?.g_carbs || 0,
                  fat: item.food.rounded_nutrition_info?.g_fat || 0,
                  fiber: item.food.rounded_nutrition_info?.g_fiber || 0,
                  sodium: item.food.rounded_nutrition_info?.mg_sodium || 0,
                  nutrisliceId: String(item.food.id),
                });
              }
            }
          }
        }
      }

      console.log(`Found ${foods.length} food items`);

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