"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, ImageOff, Monitor, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

export type AspectRatioPreset = "16:9" | "21:9";

export interface BannerAspectPreviewProps {
  imageUrl: string;
  title?: string;
  className?: string;
}

export function BannerAspectPreview({
  imageUrl,
  title = "Event Banner Preview",
  className,
}: BannerAspectPreviewProps): React.JSX.Element {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>("16:9");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [prevUrl, setPrevUrl] = useState(imageUrl);

  if (imageUrl !== prevUrl) {
    setPrevUrl(imageUrl);
    setHasError(false);
    setIsLoading(true);
  }

  const trimmedUrl = imageUrl?.trim();
  const isValidUrl = Boolean(trimmedUrl && /^https?:\/\//i.test(trimmedUrl));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          <ImageIcon className="size-3.5 text-slate-400" />
          <span>Live Aspect Ratio Preview</span>
        </label>

        {/* Aspect Ratio Toggle Pills */}
        <div
          role="radiogroup"
          aria-label="Banner aspect ratio selection"
          className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-900"
        >
          <button
            type="button"
            role="radio"
            aria-checked={aspectRatio === "16:9"}
            onClick={() => setAspectRatio("16:9")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
              aspectRatio === "16:9"
                ? "bg-white font-semibold text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            <Monitor className="size-3.5" />
            <span>16:9 (Standard)</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={aspectRatio === "21:9"}
            onClick={() => setAspectRatio("21:9")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
              aspectRatio === "21:9"
                ? "bg-white font-semibold text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            <Clapperboard className="size-3.5" />
            <span>21:9 (Cinematic)</span>
          </button>
        </div>
      </div>

      {/* Preview Viewport Container */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900/90 transition-all duration-300 dark:border-slate-800",
          aspectRatio === "16:9" ? "aspect-video" : "aspect-21/9",
        )}
      >
        {isValidUrl && !hasError ? (
          <>
            <Image
              src={trimmedUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
              className={cn(
                "object-cover transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100",
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setHasError(true);
                setIsLoading(false);
              }}
              unoptimized
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
                <div className="size-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            {hasError ? (
              <>
                <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                  <ImageOff className="size-5" />
                </div>
                <p className="text-sm font-medium text-slate-200">Unable to load image preview</p>
                <p className="mt-1 max-w-xs text-xs text-slate-400">
                  Please verify that the URL is a reachable, public HTTPS image asset.
                </p>
              </>
            ) : (
              <>
                <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                  <ImageIcon className="size-5" />
                </div>
                <p className="text-sm font-medium text-slate-300">No banner image URL provided</p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  Enter an HTTPS image URL above to see a live preview in {aspectRatio} format.
                </p>
              </>
            )}
          </div>
        )}

        {/* Aspect Ratio Badge Overlay */}
        <div className="absolute top-2.5 right-2.5 rounded-md bg-black/60 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-200 backdrop-blur-md">
          {aspectRatio}
        </div>
      </div>
    </div>
  );
}
