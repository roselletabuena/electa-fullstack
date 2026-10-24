"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  readonly className?: string;
  readonly showLabel?: boolean;
  readonly variant?: "pill" | "icon" | "ghost";
}

function useSafeTheme(): {
  theme: "light" | "dark";
  toggleTheme: () => void;
  mounted: boolean;
} {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { theme, toggleTheme, mounted } = useTheme();
    return { theme, toggleTheme, mounted };
  } catch {
    // Fallback gracefully when rendered outside ThemeProvider (e.g. in isolated unit tests)
    return { theme: "light", toggleTheme: () => {}, mounted: true };
  }
}

function ThemeIcon({
  theme,
  className,
  lightClassName,
}: Readonly<{ theme: "light" | "dark"; className: string; lightClassName: string }>) {
  return theme === "dark" ? (
    <Sun className={cn(className, "text-amber-400")} />
  ) : (
    <Moon className={cn(className, lightClassName)} />
  );
}

export function ThemeToggle({
  className,
  showLabel = true,
  variant = "pill",
}: Readonly<ThemeToggleProps>) {
  const { theme, toggleTheme } = useSafeTheme();
  const nextMode = theme === "light" ? "dark" : "light";

  if (variant === "ghost") {
    return (
      <button
        type="button"
        suppressHydrationWarning
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        className={cn(
          "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-none border-0 bg-transparent text-slate-200 transition-colors select-none hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-400",
          className,
        )}
      >
        <ThemeIcon theme={theme} className="h-4 w-4" lightClassName="text-slate-200" />
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        suppressHydrationWarning
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-none border border-slate-300 bg-white text-slate-800 transition-colors select-none hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-600 dark:border-slate-800 dark:bg-[#0D1424] dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:focus-visible:outline-sky-400",
          className,
        )}
      >
        <ThemeIcon theme={theme} className="h-4 w-4" lightClassName="text-current" />
      </button>
    );
  }

  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-none border border-slate-300 bg-white px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider text-slate-800 uppercase transition-all duration-150 select-none hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-600 active:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:focus-visible:outline-sky-400",
        className,
      )}
    >
      <ThemeIcon theme={theme} className="h-3.5 w-3.5" lightClassName="text-slate-700" />
      {showLabel && <span>{nextMode === "light" ? "Light Mode" : "Dark Mode"}</span>}
    </button>
  );
}
