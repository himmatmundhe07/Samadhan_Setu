/**
 * Samadhan Setu — Auth Store (Zustand)
 * Manages user authentication state, JWT token, and profile.
 * Automatically synchronizes JWT token with Axios API service.
 * Token is persisted to expo-secure-store (encrypted) so it survives app restarts.
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '../services/api';

const TOKEN_KEY = 'samadhan_jwt_token';
const USER_KEY = 'samadhan_user';

export interface User {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  district?: string;
  pincode?: string;
  village_or_city?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  role: 'citizen' | 'admin' | 'university' | 'industry';
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setGuest: (guest: boolean) => void;
  updateProfile: (updates: Partial<User>) => void;
  initAuth: () => Promise<void>; // Restore token from AsyncStorage on boot
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isGuest: false,

  setUser: (user) => set({ user }),

  setToken: (token) => {
    setAuthToken(token);
    set({ token, isAuthenticated: Boolean(token) });
  },

  login: (user, token) => {
    setAuthToken(token);
    // Persist token + user securely (encrypted) so session survives app restarts
    SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch(() => {});
    set({
      user,
      token,
      isAuthenticated: true,
      isGuest: false,
    });
  },

  logout: () => {
    setAuthToken(null);
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
    });
  },

  initAuth: async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (storedToken && storedUser) {
        const user: User = JSON.parse(storedUser);
        setAuthToken(storedToken);
        set({
          user,
          token: storedToken,
          isAuthenticated: true,
          isGuest: false,
        });
        console.log('[Auth] Restored session from SecureStore for:', user.full_name);
      }
    } catch (e) {
      console.warn('[Auth] Could not restore session:', e);
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setGuest: (isGuest) => set({ isGuest }),

  updateProfile: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
