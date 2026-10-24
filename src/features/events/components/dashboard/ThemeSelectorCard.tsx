"use client";

import React from "react";
import { Check } from "lucide-react";
import type { ThemeDefinition, EventTheme } from "@/features/events/types/theme";
import { cn } from "@/lib/utils";

export interface ThemeSelectorCardProps {
  theme: ThemeDefinition;
  isSelected: boolean;
  onSelect: (themeId: EventTheme) => void;
  disabled?: boolean;
  className?: string;
}

export function ThemeSelectorCard({
  theme,
  isSelected,
  onSelect,
  disabled = false,
  className,
}: Readonly<ThemeSelectorCardProps>): React.JSX.Element {
  const { tokens } = theme;

  const handleClick = () => {
    if (!disabled) {
      onSelect(theme.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!disabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSelect(theme.id);
    }
  };

  const headingFontDisplay = theme.id === "PAGEANT_EDITORIAL" ? "Cormorant Garamond" : "Outfit";
  const bodyFontDisplay = theme.id === "PAGEANT_EDITORIAL" ? "Plus Jakarta Sans" : "Sora";

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      aria-label={`${theme.displayName} theme`}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex flex-col justify-between rounded-none border p-4 transition-all duration-150 focus:ring-2 focus:ring-sky-500 focus:outline-hidden",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        isSelected
          ? "border-sky-600 bg-sky-50/30 ring-1 ring-sky-600 shadow-xs dark:border-sky-500 dark:bg-sky-950/20 dark:ring-sky-500"
          : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/40",
        className,
      )}
    >
      <div>
        {/* Top Header: Radio / Checkmark + Active Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-4.5 shrink-0 items-center justify-center rounded-none border transition-colors",
                isSelected
                  ? "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950"
                  : "border-slate-400 bg-white dark:border-slate-600 dark:bg-slate-950",
              )}
            >
              {isSelected && <Check className="size-3 stroke-[3]" />}
            </div>
            <h4 className="font-heading text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {theme.displayName}
            </h4>
          </div>

          {isSelected && (
            <span className="inline-flex shrink-0 items-center rounded-none border border-sky-600/40 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-sky-700 uppercase dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-300">
              Active Theme
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-2 font-sans text-xs text-slate-600 line-clamp-2 dark:text-slate-400">
          {theme.description}
        </p>

        {/* Palette Swatches */}
        <div className="mt-3.5 space-y-1.5 border-t border-slate-200/70 pt-3 dark:border-slate-800/70">
          <span className="font-heading text-[10px] font-extrabold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Color Palette
          </span>
          <div className="flex items-center gap-2">
            <div
              title={`Base Background: ${tokens.bgBase}`}
              className="size-5 shrink-0 rounded-none border border-slate-300 shadow-2xs dark:border-slate-700"
              style={{ backgroundColor: tokens.bgBase }}
            />
            <div
              title={`Surface: ${tokens.bgSurface}`}
              className="size-5 shrink-0 rounded-none border border-slate-300 shadow-2xs dark:border-slate-700"
              style={{ backgroundColor: tokens.bgSurface }}
            />
            <div
              title={`Primary Accent: ${tokens.accentPrimary}`}
              className="size-5 shrink-0 rounded-none border border-slate-300 shadow-2xs dark:border-slate-700"
              style={{ backgroundColor: tokens.accentPrimary }}
            />
            <div
              title={`Text: ${tokens.textPrimary}`}
              className="size-5 shrink-0 rounded-none border border-slate-300 shadow-2xs dark:border-slate-700"
              style={{ backgroundColor: tokens.textPrimary }}
            />
          </div>
        </div>
      </div>

      {/* Typography Footnote Badges */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-200/70 pt-2.5 dark:border-slate-800/70">
        <span className="inline-flex items-center rounded-none border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Aa {headingFontDisplay}
        </span>
        <span className="inline-flex items-center rounded-none border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Body {bodyFontDisplay}
        </span>
      </div>
    </div>
  );
}
