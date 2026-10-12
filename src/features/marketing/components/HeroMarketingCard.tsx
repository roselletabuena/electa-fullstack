import React from "react";
import { Check } from "lucide-react";
import { DEFAULT_HERO_MARKETING_CONFIG } from "../utils";
import type { HeroMarketingCardProps } from "../types";
import { FeatureTile } from "./FeatureTile";
import { HighlightsRibbon } from "./HighlightsRibbon";

export function HeroMarketingCard({
  className = "",
  config = DEFAULT_HERO_MARKETING_CONFIG,
}: HeroMarketingCardProps) {
  // Extract accent words for visual styling (e.g. "CHOOSE ELECTA")
  const renderStyledHeadline = (headline: string) => {
    if (headline.includes("CHOOSE ELECTA")) {
      const parts = headline.split("CHOOSE ELECTA");
      return (
        <>
          {parts[0]}
          <span className="text-sky-600 dark:text-sky-400">CHOOSE ELECTA</span>
          {parts[1]}
        </>
      );
    }
    return headline;
  };

  return (
    <section
      aria-labelledby="marketing-showcase-heading"
      className={`border border-slate-200/80 bg-white shadow-xs transition-colors dark:border-slate-800 dark:bg-[#0d1424] ${className}`}
    >
      {/* Header with headline */}
      <div className="px-6 pt-6 sm:px-7 sm:pt-7">
        <h2
          id="marketing-showcase-heading"
          className="font-heading text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white"
        >
          {renderStyledHeadline(config.headline)}
        </h2>
      </div>

      {/* 4 Feature Value Tiles (2x2 Grid) */}
      <div className="grid grid-cols-1 gap-5 px-6 pt-5 pb-6 sm:grid-cols-2 sm:gap-6 sm:px-7 sm:pt-6 sm:pb-7">
        {config.tiles.map((tile) => (
          <FeatureTile key={tile.id} tile={tile} />
        ))}
      </div>

      {/* Truthful Platform Highlights Ribbon */}
      <HighlightsRibbon metrics={config.metrics} />

      {/* Assurance Trust Footnote */}
      <div className="flex items-center justify-center border-t border-slate-100/80 px-4 py-3 text-center sm:px-6 dark:border-slate-800/60">
        <p className="flex items-center justify-center gap-1.5 font-sans text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Check
            className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <span>{config.assuranceFootnote.replace(/^✓\s*/, "")}</span>
        </p>
      </div>
    </section>
  );
}
