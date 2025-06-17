import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  initialized: false,
  
  initializeAuth: async () => {
    const state = useAuthStore.getState();
    if (state.initialized) return;
    
    try {
      set({ loading: true, error: null });
      
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const user = await authService.getCurrentUser();
        set({ user, isAuthenticated: true, loading: false, initialized: true });
      } else {
        set({ user: null, isAuthenticated: false, loading: false, initialized: true });
      }
      
      // Listen for auth changes
      const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, isAuthenticated: false });
        }
      });
      
      // Store subscription for cleanup if needed
      (window as any).__authSubscription = subscription;
      
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize auth',
        loading: false 
      });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      await authService.signIn(email, password);
      const user = await authService.getCurrentUser();
      
      set({ user, isAuthenticated: true, loading: false });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Login failed',
        loading: false 
      });
      return false;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ loading: true, error: null });
      
      await authService.signUp(email, password, name);
      
      // Auto login after signup
      await authService.signIn(email, password);
      const user = await authService.getCurrentUser();
      
      set({ user, isAuthenticated: true, loading: false });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Signup failed',
        loading: false 
      });
      return false;
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      
      await authService.signInWithGoogle();
      
      // The OAuth flow will redirect, so we don't need to do anything else here
      return true;
    } catch (error) {
      console.error('Google sign-in error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Google sign-in failed',
        loading: false 
      });
      return false;
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await authService.signOut();
      set({ user: null, isAuthenticated: false, loading: false });
    } catch (error) {
      console.error('Logout error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Logout failed',
        loading: false 
      });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      set({ loading: true, error: null });
      const updatedProfile = await authService.updateProfile(updates);
      set({ user: updatedProfile, loading: false });
    } catch (error) {
      console.error('Profile update error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update profile',
        loading: false 
      });
      throw error;
    }
  }
}));