import { create } from 'zustand';

const savedTheme = localStorage.getItem('utpt-theme') || 'light';

export const useAuthStore = create((set) => ({
    user: null,
    role: null,
    setUser: (user) => set({ user, role: user?.role }),
    logout: () => set({ user: null, role: null }),

    viewingStudent: null,
    setViewingStudent: (student) => set({ viewingStudent: student }),
    clearViewingStudent: () => set({ viewingStudent: null }),

    theme: savedTheme,
    toggleTheme: () =>
        set((state) => {
            const next = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('utpt-theme', next);
            return { theme: next };
        }),
}));
