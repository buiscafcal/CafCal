import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const usePremiumStore = create((set) => ({
  isPremium: false,
  expiresAt: null,
  isLoading: false,
  error: null,

  checkPremiumStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/premium/status`);
      set({ isPremium: response.data.isPremium, expiresAt: response.data.expiresAt, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to check premium status';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  upgradeToPremium: async (planType = 'monthly') => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/premium/upgrade`, { planType });
      set({ isPremium: response.data.user.is_premium, expiresAt: response.data.user.premium_expires_at, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Upgrade failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));