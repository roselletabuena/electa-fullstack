import React from "react";
import { cn } from "@/lib/utils";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export interface SiteShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Global page chrome: sticky SiteHeader on top, SiteFooter pinned to the bottom,
 * page content filling the space between (VS-100 / VS-101).
 */
export function SiteShell({ children, className }: Readonly<SiteShellProps>): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-slate-50 transition-colors dark:bg-[#090D16]",
        className,
      )}
    >
      <SiteHeader />
      <div className="flex w-full flex-1 flex-col">{children}</div>
      <SiteFooter variant="streamlined" />
    </div>
  );
}
