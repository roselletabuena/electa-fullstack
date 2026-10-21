"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CopySlugButtonProps {
  slug: string;
  className?: string;
  variant?: "outline" | "ghost" | "secondary" | "default";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export function CopySlugButton({
  slug,
  className,
  variant = "outline",
  size = "sm",
  showLabel = true,
}: Readonly<CopySlugButtonProps>): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://electa.app";
      const publicUrl = `${origin}/events/${slug}`;

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        // Fallback for environments without Async Clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = publicUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy public URL:", error);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      aria-label={copied ? "Public link copied to clipboard" : `Copy public link for ${slug}`}
      className={cn(
        "cursor-pointer gap-2 transition-all duration-200 select-none",
        copied
          ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          : "hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-emerald-700 dark:text-emerald-400" />
          {showLabel && (
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Copied!
            </span>
          )}
        </>
      ) : (
        <>
          <Copy className="size-3.5 text-slate-500 dark:text-slate-400" />
          {showLabel && <span className="text-xs font-bold">Copy Public Link</span>}
        </>
      )}
    </Button>
  );
}
