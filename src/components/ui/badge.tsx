import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-none font-mono text-[10px] font-bold uppercase tracking-wider transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white px-2.5 py-0.5 border border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100",
        number:
          "bg-white/95 text-slate-900 px-2.5 py-0.5 border border-slate-300 font-extrabold tracking-widest shadow-xs dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
        category:
          "bg-slate-900 text-white px-2.5 py-0.5 tracking-wider font-extrabold dark:bg-slate-100 dark:text-slate-900",
        rank1:
          "bg-slate-900 text-white font-black px-2 py-0.5 tracking-widest uppercase border border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100",
        accent:
          "bg-sky-600 text-white font-extrabold px-2.5 py-0.5 border border-sky-600 dark:bg-sky-500",
        outline:
          "border border-slate-300 bg-transparent text-slate-800 px-2.5 py-0.5 dark:border-slate-700 dark:text-slate-300",
        muted:
          "bg-slate-100 text-slate-600 px-2 py-0.5 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: Readonly<BadgeProps>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
