import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useFoodStore = create((set, get) => ({
  foods: [],
  schools: [],
  selectedSchool: null,
  isLoading: false,
  error: null,

  fetchSchools: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/schools`);
      set({ schools: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch schools';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  selectSchool: async (schoolId) => {
    set({ isLoading: true, error: null, selectedSchool: schoolId });
    try {
      await axios.post(`${API_URL}/schools/select`, { schoolId });
      await get().fetchFoods(schoolId);
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to select school';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchFoods: async (schoolId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/foods/school/${schoolId}`);
      set({ foods: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch foods';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  searchFoods: async (schoolId, query) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/foods/search/${schoolId}`, {
        params: { q: query },
      });
      set({ foods: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Search failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));