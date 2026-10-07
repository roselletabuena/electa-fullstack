"use client";

import React from "react";
import { Toaster as Sonner } from "sonner";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Loader2, X } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";

export type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme === "dark" ? "dark" : "light"}
      className="toaster group"
      position="top-center"
      duration={4000}
      offset="16px"
      gap={8}
      icons={{
        error: <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />,
        success: (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ),
        warning: <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />,
        info: <Info className="size-4 shrink-0 text-sky-600 dark:text-sky-400" />,
        loading: (
          <Loader2 className="size-4 shrink-0 animate-spin text-sky-600 dark:text-sky-400" />
        ),
        close: (
          <X className="size-3.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200" />
        ),
      }}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast !rounded-none font-sans !border !border-slate-300 dark:!border-slate-800 !bg-white dark:!bg-[#0d1424] !text-slate-900 dark:!text-slate-100 !shadow-lg dark:!shadow-2xl !py-2.5 !px-3.5 !gap-2.5 !min-h-0 !w-auto !max-w-md select-none transition-all duration-200",
          title:
            "font-heading font-extrabold text-xs tracking-tight text-slate-900 dark:text-slate-100 uppercase",
          description: "font-sans text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug",
          icon: "shrink-0 self-center",
          content: "flex flex-col justify-center min-w-0 pr-1",
          closeButton:
            "!rounded-none !border !border-slate-300 dark:!border-slate-700 !bg-slate-50 dark:!bg-slate-900 !text-slate-500 hover:!text-slate-900 dark:hover:!text-white !size-5 transition-colors",
          actionButton:
            "!rounded-none font-sans font-bold uppercase tracking-wider text-xs !bg-slate-900 !text-white hover:!bg-slate-800 dark:!bg-slate-100 dark:!text-slate-900 dark:hover:!bg-white !px-2.5 !py-1",
          cancelButton:
            "!rounded-none font-sans font-bold uppercase tracking-wider text-xs !bg-slate-100 !text-slate-700 hover:!bg-slate-200 dark:!bg-slate-800 dark:text-slate-300 !px-2.5 !py-1",
          error: "!border-l-4 !border-l-rose-600 dark:!border-l-rose-500",
          success: "!border-l-4 !border-l-emerald-600 dark:!border-l-emerald-500",
          warning: "!border-l-4 !border-l-amber-500 dark:!border-l-amber-400",
          info: "!border-l-4 !border-l-sky-600 dark:!border-l-sky-500",
        },
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
