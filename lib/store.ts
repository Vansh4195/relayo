/**
 * Zustand global state store
 * Manages app-wide state: theme, user, selected filters, etc.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AppState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Current location/workspace (Phase 2: multi-tenant)
  currentLocation: string;
  setCurrentLocation: (location: string) => void;

  // Sidebar collapsed state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Unread messages count
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Authentication
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),

      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // Location
      currentLocation: 'Main Location',
      setCurrentLocation: (location) => set({ currentLocation: location }),

      // Sidebar
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Unread
      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),
    }),
    {
      name: 'relayo-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
