import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'https://cafcal-production.up.railway.app/api';

export const useTrackingStore = create((set, get) => ({
  dailyTracking: null,
  foodLogs: [],
  isLoading: false,
  error: null,

  fetchDailyTracking: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tracking/daily/${date}`);
      set({ dailyTracking: response.data, foodLogs: response.data.foodLogs || [], isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch tracking';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logFood: async (foodItemId, mealType, servingSize, trackingDate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/tracking/log`, {
        foodItemId, mealType, servingSize, trackingDate,
      });
      await get().fetchDailyTracking(trackingDate);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to log food';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  removeFood: async (logId, trackingDate) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/tracking/log/${logId}`);
      await get().fetchDailyTracking(trackingDate);
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to remove food';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));