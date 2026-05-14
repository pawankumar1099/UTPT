import { create } from 'zustand';

const TOKEN_KEY = 'utpt_token';
const USER_KEY  = 'utpt_user';

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create((set) => ({
  user: loadUser(),
  role: loadUser()?.role ?? null,

  setUser: (user, token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user)  localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, role: user?.role ?? null });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, role: null, viewingStudent: null });
  },

  viewingStudent: null,
  setViewingStudent:   (student) => set({ viewingStudent: student }),
  clearViewingStudent: ()        => set({ viewingStudent: null }),
}));
