import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    role: null,
    setUser: (user) => set({ user, role: user?.role }),
    logout: () => set({ user: null, role: null }),

    viewingStudent: null,
    setViewingStudent: (student) => set({ viewingStudent: student }),
    clearViewingStudent: () => set({ viewingStudent: null }),
}));
