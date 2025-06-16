import { create } from 'zustand';
import { mockUsers, setCurrentUser, initializeData, type User } from '../data/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  allUsers: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  allUsers: mockUsers,
  
  initializeAuth: () => {
    initializeData();
    const savedUserId = localStorage.getItem('currentUserId');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (savedUserId && isAuthenticated) {
      const user = mockUsers.find(u => u.id === savedUserId);
      if (user) {
        set({ user, isAuthenticated: true });
      }
    }
  },

  login: async (email: string, password: string) => {
    // Simulación de login - buscar usuario por email
    if (email && password) {
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setCurrentUser(user.id);
        localStorage.setItem('isAuthenticated', 'true');
        set({ user, isAuthenticated: true });
        return true;
      }
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('isAuthenticated');
    set({ user: null, isAuthenticated: false });
  },

  switchUser: (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(userId);
      localStorage.setItem('isAuthenticated', 'true');
      set({ user, isAuthenticated: true });
    }
  }
}));