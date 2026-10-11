import React from "react";
import Link from "next/link";
import { ElectaSymbol } from "@/components/shared/electa-symbol";
import { cn } from "@/lib/utils";
import type { BrandMarkProps } from "../types";

export function BrandMark({
  className,
  size = 32,
  showTagline = true,
  href = "/",
}: Readonly<BrandMarkProps>) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400",
        className,
      )}
      aria-label="Electa - Home"
    >
      <ElectaSymbol size={size} className="transition-transform group-hover:scale-105" />
      <div className="flex flex-col">
        <span className="font-heading text-xl font-black leading-none tracking-tight text-slate-900 select-none sm:text-2xl dark:text-white">
          ELECTA
        </span>
        {showTagline && (
          <span className="mt-1 hidden text-[9px] font-bold tracking-widest text-slate-500 uppercase select-none sm:block dark:text-slate-400">
            VOTE · ENGAGE · CELEBRATE
          </span>
        )}
      </div>
    </Link>
  );
}
