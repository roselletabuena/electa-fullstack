"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  readonly children: React.ReactNode;
  readonly defaultTheme?: Theme;
}

function applyDocumentTheme(currentTheme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (currentTheme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

const themeListeners = new Set<() => void>();

function notifyThemeListeners() {
  for (const listener of themeListeners) {
    listener();
  }
}

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    themeListeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

export function ThemeProvider({ children, defaultTheme = "light" }: Readonly<ThemeProviderProps>) {
  const getSnapshot = useCallback((): Theme => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      const stored = (localStorage.getItem("electa-theme") ??
        localStorage.getItem("votesphere-theme")) as Theme | null;
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    } catch {
      // Gracefully handle restricted localStorage environments (e.g. sandboxed iframes)
    }
    return defaultTheme;
  }, [defaultTheme]);

  const getServerSnapshot = useCallback((): Theme => defaultTheme, [defaultTheme]);

  const theme = useSyncExternalStore(subscribeTheme, getSnapshot, getServerSnapshot);

  const mounted = useSyncExternalStore(
    subscribeTheme,
    () => true,
    () => false,
  );

  useEffect(() => {
    applyDocumentTheme(theme);
  }, [theme]);

  const handleSetTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem("electa-theme", newTheme);
    } catch {
      // Gracefully handle restricted localStorage environments
    }
    applyDocumentTheme(newTheme);
    notifyThemeListeners();
  }, []);

  const toggleTheme = useCallback(() => {
    const currentTheme = getSnapshot();
    const nextTheme: Theme = currentTheme === "light" ? "dark" : "light";
    try {
      localStorage.setItem("electa-theme", nextTheme);
    } catch {
      // Gracefully handle restricted localStorage environments
    }
    applyDocumentTheme(nextTheme);
    notifyThemeListeners();
  }, [getSnapshot]);

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme: handleSetTheme,
      toggleTheme,
      mounted,
    }),
    [theme, handleSetTheme, toggleTheme, mounted],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
