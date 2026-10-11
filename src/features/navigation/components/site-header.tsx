import React from "react";
import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";
import type { SiteHeaderProps } from "../types";

export function SiteHeader({
  className,
  showActions = true,
}: Readonly<SiteHeaderProps>) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-slate-300 bg-white/95 backdrop-blur-xs transition-colors dark:border-slate-800 dark:bg-[#090D16]/95",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandMark />

        {showActions && (
          <nav aria-label="Main Navigation" className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle variant="icon" />

            <Link
              href="/events/new"
              className="inline-flex h-9 items-center justify-center rounded-none border border-slate-300 bg-transparent px-2.5 font-heading text-xs font-extrabold tracking-wider text-slate-800 uppercase transition-colors hover:border-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-600 sm:px-4 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-400 dark:hover:bg-slate-800 dark:focus-visible:outline-sky-400"
              aria-label="Create a new event"
            >
              <span className="sm:hidden">+ Event</span>
              <span className="hidden sm:inline">+ Create Event</span>
            </Link>

            <Link
              href="/login"
              className="btn-primary inline-flex h-9 items-center justify-center rounded-none border border-slate-900 bg-slate-900 px-3 font-heading text-xs font-extrabold tracking-wider text-white shadow-xs transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-sky-600 sm:px-4 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:outline-sky-400"
              aria-label="Sign in to your account"
            >
              Sign In
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
