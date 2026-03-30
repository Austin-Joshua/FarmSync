import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  location?: string;
  land_size?: number;
  soil_type?: string;
  picture_url?: string;
  is_onboarded?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  loginWithToken: (token: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (partialUser) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null
        })),
      login: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        set({ user: null, token: null, isAuthenticated: false });
      },
      loginWithToken: async (token) => {
        try {
          localStorage.setItem('token', token);
          const response = await fetch('http://localhost:8080/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            const user = data.user || data;
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token, isAuthenticated: true });
            return true;
          }
          return false;
        } catch {
          localStorage.removeItem('token');
          return false;
        }
      },
    }),
    {
      name: 'farmsync-auth-storage',
    }
  )
);
