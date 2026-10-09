"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  readonly className?: string;
  readonly showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = true }: Readonly<ThemeToggleProps>) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 border border-slate-300 bg-white px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider text-slate-800 uppercase transition-all duration-150 select-none hover:border-slate-400 hover:bg-slate-100 active:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800",
        className,
      )}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-400" />
          {showLabel && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-slate-700" />
          {showLabel && <span>Dark Mode</span>}
        </>
      )}
    </button>
  );
}
