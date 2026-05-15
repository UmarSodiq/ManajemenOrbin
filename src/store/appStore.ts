import { create } from 'zustand';
import { AppUser, Role } from '../types';

interface AppState {
  user: AppUser | null;
  role: Role | null;
  isOnline: boolean;
  setUser: (user: AppUser | null) => void;
  setRole: (role: Role | null) => void;
  setIsOnline: (isOnline: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  role: null,
  isOnline: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setIsOnline: (isOnline) => set({ isOnline }),
}));
