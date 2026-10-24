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
        className="relative overflow-hidden p-4 transition-colors duration-200 sm:p-6"
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
          {(() => {
            const isPageant = theme.id === "PAGEANT_EDITORIAL";
            const radiusContainer = isPageant ? "rounded-xl" : "rounded-none";
            const radiusCard = isPageant ? "rounded-lg" : "rounded-none";
            const radiusBadge = isPageant ? "rounded-md" : "rounded-none";
            const radiusSmall = isPageant ? "rounded-sm" : "rounded-none";
            const radiusButton = isPageant ? "rounded-md" : "rounded-none";

            return (
              <>
                <div
                  style={{
                    backgroundColor: tokens.bgSurface,
                    borderColor: tokens.borderHairline,
                  }}
                  className={cn("relative overflow-hidden border p-4 sm:p-5", radiusContainer)}
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
                            color: isPageant ? "#0B0C10" : "#FFFFFF",
                          }}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase",
                            radiusBadge,
                          )}
                        >
                          <span className={cn("size-1.5 animate-pulse bg-current", radiusSmall)} />
                          Voting Live
                        </span>
                        <span
                          style={{
                            borderColor: tokens.borderHairline,
                            color: tokens.textSecondary,
                          }}
                          className={cn(
                            "border px-2 py-0.5 font-mono text-[10px] uppercase",
                            radiusBadge,
                          )}
                        >
                          Official Selection
                        </span>
                      </div>

                      <h3
                        style={{
                          color: tokens.textPrimary,
                          fontFamily: tokens.fontHeading,
                        }}
                        className="mt-2 text-lg font-bold tracking-tight sm:text-xl"
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
                      className={cn("shrink-0 border p-2.5 sm:text-right", radiusCard)}
                    >
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 uppercase">
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
                    className={cn("group relative border p-3.5 transition-all", radiusContainer)}
                  >
                    <div className="flex gap-3">
                      {/* 4:5 Candidate Portrait Placeholder */}
                      <div
                        style={{
                          backgroundColor: tokens.bgSurfaceElevated,
                          borderColor: tokens.borderHairline,
                        }}
                        className={cn(
                          "relative flex aspect-4/5 w-20 shrink-0 flex-col items-center justify-center overflow-hidden border p-1 text-center",
                          radiusCard,
                        )}
                      >
                        <Award
                          className="size-6 opacity-30"
                          style={{ color: tokens.accentPrimary }}
                        />
                        <span
                          style={{
                            backgroundColor: tokens.accentPrimary,
                            color: isPageant ? "#0B0C10" : "#FFFFFF",
                          }}
                          className={cn(
                            "py-0.2 absolute top-1 left-1 px-1 font-mono text-[9px] font-bold",
                            radiusSmall,
                          )}
                        >
                          #01
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <span
                            style={{ color: tokens.accentPrimary }}
                            className="font-mono text-[10px] font-bold tracking-wider uppercase"
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
                          <p style={{ color: tokens.textSecondary }} className="font-sans text-xs">
                            Cebu City
                          </p>
                        </div>

                        <div className="mt-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            tabIndex={-1}
                            style={{
                              backgroundColor: tokens.accentPrimary,
                              color: isPageant ? "#0B0C10" : "#FFFFFF",
                            }}
                            className={cn(
                              "font-heading inline-flex flex-1 items-center justify-center gap-1 px-2 py-1 text-[10px] font-extrabold tracking-wider uppercase",
                              radiusButton,
                            )}
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
                            className={cn(
                              "font-heading inline-flex items-center justify-center gap-1 border px-2 py-1 text-[10px] font-extrabold tracking-wider uppercase",
                              radiusButton,
                            )}
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
                    className={cn("flex flex-col justify-between border p-3.5", radiusContainer)}
                  >
                    <div>
                      <span
                        style={{ color: tokens.textSecondary }}
                        className="font-mono text-[10px] tracking-wider uppercase"
                      >
                        Theme Palette Notes
                      </span>
                      <p
                        style={{ color: tokens.textPrimary }}
                        className="mt-1 font-sans text-xs leading-relaxed"
                      >
                        {isPageant
                          ? "Haute-couture warm alabaster & deep obsidian atmospheric surfaces with radiant champagne gold accents, Cormorant Garamond serif headings, and refined soft luxury curves (6px-16px) tailored for national pageants."
                          : "Clean Opal Slate-50 surface with Sky Blue accents and Outfit/Sora typography following sharp brutalist zero-radius geometry."}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-2 font-mono text-[10px] dark:border-slate-800/50">
                      <span style={{ color: tokens.textSecondary }}>Corner Radius:</span>
                      <span style={{ color: tokens.accentPrimary }} className="font-bold">
                        {isPageant
                          ? "Soft Radii (6px, 10px, 16px, pill)"
                          : "0px (Brutalist Zero-Radius)"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
