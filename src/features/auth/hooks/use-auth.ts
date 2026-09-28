"use client";

import { useAuthStore } from "../stores/auth-store";
import { logoutAction } from "../actions/logout-action";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearStore = useAuthStore((state) => state.logout);

  const logout = async () => {
    clearStore();
    await logoutAction();
  };

  return {
    user,
    isAuthenticated,
    setUser,
    logout,
  };
}
