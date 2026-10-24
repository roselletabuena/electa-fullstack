"use client";

import React from "react";
import { Eye, Clock, Award, Heart, Zap } from "lucide-react";
import type { ThemeDefinition } from "@/features/events/types/theme";
import { themeTokensToCssVars } from "@/features/events/theme/theme-registry";
import { cn } from "@/lib/utils";

export interface ThemeAppearancePreviewProps {
  theme: ThemeDefinition;
  eventTitle: string;
  bannerUrl?: string;
  className?: string;
}

export function ThemeAppearancePreview({
  theme,
  eventTitle,
  bannerUrl,
  className,
}: Readonly<ThemeAppearancePreviewProps>): React.JSX.Element {
  const { tokens } = theme;
  const cssVars = themeTokensToCssVars(tokens);

  return (
    <div
      className={cn(
        "rounded-none border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      {/* Widget Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-sky-600 dark:text-sky-400" />
          <span className="font-heading text-xs font-extrabold tracking-wider text-slate-800 uppercase dark:text-slate-200">
            Live Appearance Preview
          </span>
        </div>

        <span className="inline-flex items-center rounded-none border border-slate-300 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Previewing: {theme.displayName}
        </span>
      </div>

      {/* Themed Preview Canvas */}
      <div
        data-event-theme={theme.slug}
        style={
          {
            ...cssVars,
            backgroundColor: tokens.bgBase,
            color: tokens.textPrimary,
          } as React.CSSProperties
        }
        className="relative overflow-hidden p-4 sm:p-6 transition-colors duration-200"
      >
        {/* Decorative Ambient Background Glow for Pageant Theme */}
        {theme.id === "PAGEANT_EDITORIAL" && (
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(203, 178, 121, 0.15), transparent 70%)",
            }}
          />
        )}

        <div className="relative space-y-4">
          {/* Miniature Hero Banner */}
          <div
            style={{
              backgroundColor: tokens.bgSurface,
              borderColor: tokens.borderHairline,
            }}
            className="relative overflow-hidden rounded-none border p-4 sm:p-5"
          >
            {bannerUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15"
                style={{ backgroundImage: `url(${bannerUrl})` }}
              />
            )}

            <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    style={{
                      backgroundColor: tokens.accentPrimary,
                      color: theme.id === "PAGEANT_EDITORIAL" ? "#0B0C10" : "#FFFFFF",
                    }}
                    className="inline-flex items-center gap-1 rounded-none px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                  >
                    <span className="size-1.5 animate-pulse rounded-none bg-current" />
                    Voting Live
                  </span>
                  <span
                    style={{
                      borderColor: tokens.borderHairline,
                      color: tokens.textSecondary,
                    }}
                    className="rounded-none border px-2 py-0.5 font-mono text-[10px] uppercase"
                  >
                    Official Selection
                  </span>
                </div>

                <h3
                  style={{
                    color: tokens.textPrimary,
                    fontFamily: tokens.fontHeading,
                  }}
                  className="mt-2 text-lg sm:text-xl font-bold tracking-tight"
                >
                  {eventTitle || "Competition Event"}
                </h3>
              </div>

              {/* Countdown Preview */}
              <div
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.borderHairline,
                }}
                className="rounded-none border p-2.5 sm:text-right shrink-0"
              >
                <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-slate-400">
                  <Clock className="size-3" style={{ color: tokens.accentPrimary }} />
                  <span>Voting Closes In</span>
                </div>
                <div
                  style={{
                    color: tokens.accentPrimary,
                    fontFamily: tokens.fontHeading,
                  }}
                  className="mt-1 font-mono text-sm font-bold tracking-wider"
                >
                  02d : 14h : 45m : 12s
                </div>
              </div>
            </div>
          </div>

          {/* Miniature Contestant Grid Snippet */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Contestant Card Preview */}
            <div
              style={{
                backgroundColor: tokens.bgSurface,
                borderColor: tokens.borderHairline,
              }}
              className="group relative rounded-none border p-3.5 transition-all"
            >
              <div className="flex gap-3">
                {/* 4:5 Candidate Portrait Placeholder */}
                <div
                  style={{
                    backgroundColor: tokens.bgSurfaceElevated,
                    borderColor: tokens.borderHairline,
                  }}
                  className="relative aspect-4/5 w-20 shrink-0 overflow-hidden rounded-none border flex flex-col items-center justify-center text-center p-1"
                >
                  <Award className="size-6 opacity-30" style={{ color: tokens.accentPrimary }} />
                  <span
                    style={{
                      backgroundColor: tokens.accentPrimary,
                      color: theme.id === "PAGEANT_EDITORIAL" ? "#0B0C10" : "#FFFFFF",
                    }}
                    className="absolute top-1 left-1 rounded-none px-1 py-0.2 font-mono text-[9px] font-bold"
                  >
                    #01
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <span
                      style={{ color: tokens.accentPrimary }}
                      className="font-mono text-[10px] font-bold uppercase tracking-wider"
                    >
                      Candidate #01
                    </span>
                    <h5
                      style={{
                        color: tokens.textPrimary,
                        fontFamily: tokens.fontHeading,
                      }}
                      className="text-sm font-bold tracking-tight"
                    >
                      Sample Candidate
                    </h5>
                    <p
                      style={{ color: tokens.textSecondary }}
                      className="font-sans text-xs"
                    >
                      Cebu City
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      tabIndex={-1}
                      style={{
                        backgroundColor: tokens.accentPrimary,
                        color: theme.id === "PAGEANT_EDITORIAL" ? "#0B0C10" : "#FFFFFF",
                      }}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-none px-2 py-1 font-heading text-[10px] font-extrabold uppercase tracking-wider"
                    >
                      <Heart className="size-2.5" />
                      Vote Free
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      style={{
                        borderColor: tokens.accentPrimary,
                        color: tokens.accentPrimary,
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-none border px-2 py-1 font-heading text-[10px] font-extrabold uppercase tracking-wider"
                    >
                      <Zap className="size-2.5" />
                      Boost
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography & Aesthetic Note */}
            <div
              style={{
                backgroundColor: tokens.bgSurface,
                borderColor: tokens.borderHairline,
              }}
              className="flex flex-col justify-between rounded-none border p-3.5"
            >
              <div>
                <span
                  style={{ color: tokens.textSecondary }}
                  className="font-mono text-[10px] uppercase tracking-wider"
                >
                  Theme Palette Notes
                </span>
                <p
                  style={{ color: tokens.textPrimary }}
                  className="mt-1 font-sans text-xs leading-relaxed"
                >
                  {theme.id === "PAGEANT_EDITORIAL"
                    ? "Deep obsidian atmospheric surfaces with champagne gold accents and Cormorant Garamond serif headings tailored for national pageants."
                    : "Clean Opal Slate-50 surface with Sky Blue accents and Outfit/Sora typography following sharp brutalist zero-radius geometry."}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-2 text-[10px] font-mono dark:border-slate-800/50">
                <span style={{ color: tokens.textSecondary }}>Corner Radius:</span>
                <span style={{ color: tokens.accentPrimary }} className="font-bold">
                  0px (Brutalist Zero-Radius)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
