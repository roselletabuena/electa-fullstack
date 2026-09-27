"use client";

import React, { useState } from "react";
import { Play, ExternalLink, VideoOff } from "lucide-react";
import type { ContestantMediaDto } from "../types";
import { parseVideoEmbedUrl } from "../utils/parse-video-embed";

interface VideoReelPlayerProps {
  media: ContestantMediaDto;
  candidateName: string;
}

export const VideoReelPlayer: React.FC<VideoReelPlayerProps> = ({ media, candidateName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const parsed = parseVideoEmbedUrl(media.url);

  if (!parsed) {
    return (
      <div className="flex aspect-9/16 max-h-125 w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900 p-6 text-center">
        <VideoOff className="mb-2 h-10 w-10 text-slate-500" />
        <p className="text-sm font-medium text-slate-400">Video preview unavailable</p>
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
        >
          <span>Watch on external site</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-9/16 max-h-137.5 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-xl dark:border-slate-800">
      {!isPlaying ? (
        <div
          onClick={() => setIsPlaying(true)}
          className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 p-6 text-center"
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-linear-to-tr from-indigo-600 to-rose-600 text-white shadow-xl shadow-indigo-500/20 transition-transform group-hover:scale-110">
            <Play className="size-8 translate-x-0.5 fill-white" />
          </div>

          <h4 className="mt-4 text-sm font-semibold text-slate-200">
            {candidateName} Official Video Reel
          </h4>
          <span className="mt-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium tracking-wider text-slate-400 uppercase">
            {parsed.platform}
          </span>
        </div>
      ) : (
        <iframe
          src={parsed.embedUrl}
          title={`${candidateName} Video`}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
};
