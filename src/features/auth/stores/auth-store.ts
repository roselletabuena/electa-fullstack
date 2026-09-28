import { create } from "zustand";
import type { UserSessionDto } from "../types";

interface AuthState {
  user: UserSessionDto | null;
  isAuthenticated: boolean;
  setUser: (user: UserSessionDto | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
    }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));
