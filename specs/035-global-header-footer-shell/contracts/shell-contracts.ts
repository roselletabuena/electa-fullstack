import type React from "react";

/**
 * Contract for the global shell (035-global-header-footer-shell).
 * Implemented by `SiteShell` in src/features/navigation/components/site-shell.tsx.
 */
export interface SiteShellContract {
  readonly children: React.ReactNode;
  readonly className?: string;
}

/** Route groups that must render the shell. */
export const SHELL_ROUTE_GROUPS = ["(public)", "(dashboard)"] as const;

/** Route groups that must NOT render any header/footer chrome. */
export const CHROME_FREE_ROUTE_GROUPS = ["(fullscreen)"] as const;
