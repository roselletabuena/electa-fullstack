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
    <div className="flex flex-col gap-2">
      {/* Primary Action: Share / Download */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleShare}
          disabled={!isReady || isSharing}
          className="flex h-9 items-center justify-center gap-1.5 border border-sky-600 bg-sky-600 px-3 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-sky-500 active:scale-[0.99] disabled:opacity-50"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share Story</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!isReady}
          className="flex h-9 items-center justify-center gap-1.5 border border-slate-900 bg-slate-900 px-3 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download</span>
        </button>
      </div>

      {/* Secondary Action: Copy Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="flex h-8 items-center justify-center gap-1.5 border border-slate-200 bg-slate-50 px-3 font-sans text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              Voting Link Copied!
            </span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3 text-slate-400" />
            <span>Copy Direct Candidate Voting Link</span>
          </>
        )}
      </button>
    </div>
  );
}
