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
      const origin =
        typeof window !== "undefined" ? window.location.origin : "https://votesphere.app";
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
        document.body.removeChild(textArea);
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
        "cursor-pointer gap-2 transition-all duration-200",
        copied
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "hover:border-slate-300 dark:hover:border-slate-700",
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-emerald-500" />
          {showLabel && <span className="text-xs font-semibold text-emerald-500">Copied!</span>}
        </>
      ) : (
        <>
          <Copy className="size-3.5 text-slate-500 dark:text-slate-400" />
          {showLabel && <span className="text-xs font-medium">Copy Public Link</span>}
        </>
      )}
    </Button>
  );
}
