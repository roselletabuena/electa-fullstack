import React from "react";
import { cn } from "@/lib/utils";

interface ElectaSymbolProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Electa Brand Symbol (Logo Mark Only)
 *
 * Brutalist-refined geometric emblem from Electa Logo:
 * Slate-900 square bracket ballot box / C-frame with sky blue victory checkmark.
 * Fully theme-adaptive with zero white background.
 */
export function ElectaSymbol({ className, size = 32, ...props }: Readonly<ElectaSymbolProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="30 24 60 72"
      width={size}
      height={size}
      fill="none"
      className={cn("shrink-0 select-none", className)}
      aria-label="Electa Logo"
      role="img"
      {...props}
    >
      {/* C-frame / Ballot Box Container (Theme-Adaptive) */}
      <rect x="36" y="30" width="12" height="60" className="fill-slate-900 dark:fill-slate-100" />
      <rect x="36" y="30" width="48" height="12" className="fill-slate-900 dark:fill-slate-100" />
      <rect x="36" y="78" width="48" height="12" className="fill-slate-900 dark:fill-slate-100" />

      {/* Victory Checkmark */}
      <path
        d="M48 62 L58 72 L82 47"
        fill="none"
        strokeWidth="11"
        strokeLinecap="square"
        strokeLinejoin="miter"
        className="stroke-sky-600 dark:stroke-sky-400"
      />
    </svg>
  );
}
