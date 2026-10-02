"use client";

import React, { useState } from "react";
import { Download, Share2, Copy, Check } from "lucide-react";
import type { StoryCardPayload, StoryGeneratorResult } from "../types/story";

interface StoryActionButtonsProps {
  payload: StoryCardPayload;
  result: StoryGeneratorResult | null;
}

export function StoryActionButtons({
  payload,
  result,
}: StoryActionButtonsProps): React.JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.dataUrl;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!result) return;
    setIsSharing(true);

    try {
      const file = new File([result.blob], result.fileName, { type: "image/png" });

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `Vote for #${payload.candidateNumber} ${payload.candidateName}!`,
          text: `I just voted for #${payload.candidateNumber} ${payload.candidateName} in ${payload.eventTitle}! Cast your vote now!`,
          url: payload.votingUrl,
          files: [file],
        });
      } else {
        // Fallback to direct download
        handleDownload();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        handleDownload();
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(payload.votingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard fallback
    }
  };

  const isReady = result !== null;

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3">
      {/* Primary Action: Share / Download */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleShare}
          disabled={!isReady || isSharing}
          className="font-heading flex h-11 items-center justify-center gap-2 border border-sky-600 bg-sky-600 px-4 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition-all hover:bg-sky-500 disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Story</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!isReady}
          className="font-heading flex h-11 items-center justify-center gap-2 border border-slate-900 bg-slate-900 px-4 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
        >
          <Download className="h-4 w-4" />
          <span>Download PNG</span>
        </button>
      </div>

      {/* Secondary Action: Copy Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="flex h-10 items-center justify-center gap-2 border border-slate-300 bg-white px-4 font-sans text-xs font-bold text-slate-800 transition-all hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400">Voting Link Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-slate-500" />
            <span>Copy Direct Candidate Voting Link</span>
          </>
        )}
      </button>
    </div>
  );
}
