"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import type { StoryCardPayload, StoryGeneratorResult } from "../types/story";
import { generateStoryCard } from "../utils/story-canvas-generator";

interface StoryCardPreviewProps {
  payload: StoryCardPayload;
  onGenerated?: (result: StoryGeneratorResult) => void;
}

export function StoryCardPreview({
  payload,
  onGenerated,
}: StoryCardPreviewProps): React.JSX.Element {
  const [result, setResult] = useState<StoryGeneratorResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function executeGeneration() {
      try {
        const res = await generateStoryCard(payload);
        if (isMounted) {
          setResult(res);
          setError(null);
          setIsGenerating(false);
          onGenerated?.(res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to generate story card.");
          setIsGenerating(false);
        }
      }
    }

    void executeGeneration();

    return () => {
      isMounted = false;
    };
  }, [payload, onGenerated]);

  return (
    <div className="relative mx-auto aspect-9/16 w-full max-w-70 overflow-hidden border-2 border-slate-900 bg-slate-950 shadow-xl sm:max-w-80 dark:border-slate-700">
      {isGenerating && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 p-4 text-center text-white backdrop-blur-xs">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          <span className="font-heading mt-3 text-xs font-black tracking-wider uppercase">
            Rendering 9:16 Story Card...
          </span>
        </div>
      )}

      {error && !isGenerating && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 p-4 text-center text-white">
          <p className="font-sans text-xs text-red-200">{error}</p>
        </div>
      )}

      {result && !isGenerating && (
        <Image
          src={result.dataUrl}
          alt={`Story Card for ${payload.candidateName}`}
          fill
          unoptimized
          className="object-contain"
        />
      )}
    </div>
  );
}
