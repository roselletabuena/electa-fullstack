import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ProgressHTMLAttributes<HTMLProgressElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

export const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const safeMax = max > 0 ? max : 100;
    const safeValue = typeof value === "number" ? Math.min(Math.max(value, 0), safeMax) : 0;
    const percentage = Math.round((safeValue / safeMax) * 100);

    return (
      <progress
        ref={ref}
        value={safeValue}
        max={safeMax}
        className={cn(
          "relative h-1.5 w-full appearance-none overflow-hidden rounded-none border-none bg-slate-200 dark:bg-slate-800",
          "[&::-webkit-progress-bar]:rounded-none [&::-webkit-progress-bar]:bg-slate-200 dark:[&::-webkit-progress-bar]:bg-slate-800",
          "[&::-webkit-progress-value]:rounded-none [&::-webkit-progress-value]:bg-slate-900 dark:[&::-webkit-progress-value]:bg-slate-100",
          "[&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-700 [&::-webkit-progress-value]:ease-out",
          "[&::-moz-progress-bar]:rounded-none [&::-moz-progress-bar]:bg-slate-900 dark:[&::-moz-progress-bar]:bg-slate-100",
          indicatorClassName,
          className,
        )}
        {...props}
      >
        {`${percentage}%`}
      </progress>
    );
  },
);
Progress.displayName = "Progress";
