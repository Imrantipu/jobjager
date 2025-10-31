import { create } from 'zustand';
import type { User } from '@/services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Actions
  setUser: (user: User | null): void =>
    set({
      user,
      isAuthenticated: user !== null,
      error: null,
    }),

  setLoading: (isLoading: boolean): void =>
    set({ isLoading }),

  setError: (error: string | null): void =>
    set({ error }),

  logout: (): void =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    }),
}));
