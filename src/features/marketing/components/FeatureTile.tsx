import React from "react";
import { ShieldCheck, Zap, Wallet, Rocket, Sparkles } from "lucide-react";
import type { FeatureTileProps } from "../types";

function renderTileIcon(icon: string, id: string): React.ReactNode {
  switch (icon) {
    case "🛡️":
    case "shield":
      return <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />;
    case "⚡":
    case "zap":
      return <Zap className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />;
    case "🇵🇭":
    case "wallet":
    case "payment":
      return <Wallet className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />;
    case "🚀":
    case "rocket":
      return <Rocket className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />;
    default:
      if (id.includes("bot") || id.includes("shield")) {
        return (
          <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
        );
      }
      if (id.includes("live") || id.includes("zap")) {
        return <Zap className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />;
      }
      if (
        id.includes("payment") ||
        id.includes("gcash") ||
        id.includes("maya") ||
        id.includes("wallet")
      ) {
        return <Wallet className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />;
      }
      if (id.includes("fast") || id.includes("rocket") || id.includes("setup")) {
        return <Rocket className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />;
      }
      return <Sparkles className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />;
  }
}

export function FeatureTile({ tile, className = "" }: FeatureTileProps) {
  return (
    <div className={`group flex items-start gap-3.5 transition-colors ${className}`}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
        aria-hidden="true"
        data-testid={`feature-icon-${tile.id}`}
      >
        {renderTileIcon(tile.icon, tile.id)}
        <span className="sr-only">{tile.icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {tile.title}
          </h3>
          {tile.badge && (
            <span className="bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-sky-700 uppercase dark:bg-sky-950/50 dark:text-sky-300">
              {tile.badge}
            </span>
          )}
        </div>
        <p className="font-sans text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          {tile.description}
        </p>
      </div>
    </div>
  );
}
