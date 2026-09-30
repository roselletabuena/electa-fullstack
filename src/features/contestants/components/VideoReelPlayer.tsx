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
      <div className="flex aspect-9/16 max-h-125 w-full flex-col items-center justify-center rounded-none border border-slate-300 bg-slate-900 p-6 text-center dark:border-white/10">
        <VideoOff className="mb-2 h-10 w-10 text-slate-500" />
        <p className="text-sm font-medium text-slate-400">Video preview unavailable</p>
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
        >
          <span>Watch on external site</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-9/16 max-h-137.5 w-full max-w-sm overflow-hidden rounded-none border border-slate-300 bg-slate-950 shadow-xl dark:border-slate-800">
      {!isPlaying ? (
        <div
          onClick={() => setIsPlaying(true)}
          className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 p-6 text-center"
        >
          <div className="flex size-16 items-center justify-center rounded-none border border-sky-400 bg-sky-600 text-white shadow-xl transition-transform group-hover:scale-110">
            <Play className="size-8 translate-x-0.5 fill-white" />
          </div>

          <h4 className="font-heading font-extrabold mt-4 text-sm text-slate-200">
            {candidateName} Official Video Reel
          </h4>
          <span className="mt-2 rounded-none border border-white/20 bg-white/10 px-3 py-1 font-mono text-[11px] font-medium tracking-wider text-slate-300 uppercase">
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
