import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signup: async (email, password, username, firstName, lastName, schoolId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/signup`, {
            email, password, username, firstName, lastName, schoolId,
          });
          set({ user: response.data.user, token: response.data.token, isAuthenticated: true, isLoading: false });
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Signup failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, { email, password });
          set({ user: response.data.user, token: response.data.token, isAuthenticated: true, isLoading: false });
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
        delete axios.defaults.headers.common['Authorization'];
      },

      getCurrentUser: async () => {
        const { token } = get();
        if (!token) return null;
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${API_URL}/auth/me`);
          set({ user: response.data, isAuthenticated: true });
          return response.data;
        } catch (error) {
          set({ isAuthenticated: false, token: null, user: null });
          delete axios.defaults.headers.common['Authorization'];
          return null;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'cafcal-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);