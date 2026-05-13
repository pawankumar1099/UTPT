import { create } from 'zustand';
import { getMe } from '@/services/auth.service';

export const useAuthStore = create((set, get) => ({
  user: null,
  role: null,
  token: null,
  initializing: true,

  setAuth: (user, token) => {
    localStorage.setItem('utpt_token', token);
    set({ user, role: user?.role, token });
  },

  logout: () => {
    localStorage.removeItem('utpt_token');
    set({ user: null, role: null, token: null });
  },

  initAuth: async () => {
    const token = localStorage.getItem('utpt_token');
    if (!token) {
      set({ initializing: false });
      return;
    }
    try {
      const user = await getMe();
      set({ user, role: user?.role, token, initializing: false });
    } catch {
      localStorage.removeItem('utpt_token');
      set({ user: null, role: null, token: null, initializing: false });
    }
  },

  viewingStudent: null,
  setViewingStudent: (student) => set({ viewingStudent: student }),
  clearViewingStudent: () => set({ viewingStudent: null }),
}));
