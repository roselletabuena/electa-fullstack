"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="animate-in fade-in-0 fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200"
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog container */}
      <div className="relative z-50 w-full max-w-lg">{children}</div>
    </div>
  );
}

export function DialogContent({
  className,
  children,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: (() => void) | undefined;
}) {
  return (
    <div
      className={cn(
        "animate-in fade-in-0 zoom-in-95 relative w-full rounded-none border border-slate-300 bg-white p-6 text-slate-900 shadow-2xl backdrop-blur-2xl duration-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
        className,
      )}
    >
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 cursor-pointer rounded-none border border-slate-200 bg-white p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-left", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "font-heading text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50",
        className,
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("font-body text-xs text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-6 flex items-center justify-end space-x-2 border-t border-slate-100 pt-4 dark:border-slate-800",
        className,
      )}
      {...props}
    />
  );
}
