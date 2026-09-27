"use client";

import React, { useState } from "react";
import { X, Sparkles, MapPin, Ruler, Heart, Video, Image as ImageIcon } from "lucide-react";
import type { ContestantDto } from "../types";
import { PhotoGalleryCarousel } from "./PhotoGalleryCarousel";
import { VideoReelPlayer } from "./VideoReelPlayer";

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface ContestantProfileModalProps {
  contestant: ContestantDto | null;
  isOpen: boolean;
  onClose: () => void;
  onVoteClick?: ((contestant: ContestantDto) => void) | undefined;
}

export const ContestantProfileModal: React.FC<ContestantProfileModalProps> = ({
  contestant,
  isOpen,
  onClose,
  onVoteClick,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<"photos" | "video">("photos");

  if (!isOpen || !contestant) return null;

  const videoMedia = contestant.media.find((m) => m.mediaType === "VIDEO_EMBED");
  const photosMedia = contestant.media.filter((m) => m.mediaType === "PHOTO");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Candidate #{String(contestant.contestantNumber).padStart(2, "0")}</span>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize dark:bg-slate-800 dark:text-slate-300">
              {contestant.division.toLowerCase()} Division
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="grid scrollbar-thin scrollbar-thumb-slate-300 grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-12 dark:scrollbar-thumb-slate-700">
          {/* Left Column: Visual Media Showcase (Carousel or Video Reel) */}
          <div className="flex flex-col gap-3 md:col-span-6">
            {/* Media Selector Tabs (if both photos and video exist) */}
            {videoMedia && (
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-950/80">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab("photos")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeMediaTab === "photos"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <ImageIcon className="size-3.5" />
                  <span>Photos ({photosMedia.length || 1})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab("video")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeMediaTab === "video"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Video className="size-3.5" />
                  <span>Video Reel</span>
                </button>
              </div>
            )}

            {/* Display Active Media Tab */}
            {activeMediaTab === "video" && videoMedia ? (
              <VideoReelPlayer media={videoMedia} candidateName={contestant.name} />
            ) : (
              <PhotoGalleryCarousel
                media={
                  photosMedia.length > 0
                    ? photosMedia
                    : [
                        {
                          id: "cov",
                          mediaType: "PHOTO",
                          url: contestant.avatarUrl,
                          embedPlatform: "NONE",
                          displayOrder: 0,
                          aspectRatio: "4:5",
                          isCover: true,
                        },
                      ]
                }
                candidateName={contestant.name}
              />
            )}
          </div>

          {/* Right Column: Candidate Dossier & Biography */}
          <div className="flex flex-col justify-between gap-6 md:col-span-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {contestant.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {contestant.hometown && (
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{contestant.hometown}</span>
                    </div>
                  )}
                  {contestant.heightCm && (
                    <div className="flex items-center gap-1 font-mono">
                      <Ruler className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{contestant.heightCm} cm</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Award Categories */}
              {contestant.categories.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Nominated Award Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {contestant.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="rounded-md border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Advocacy Statement */}
              {contestant.advocacy && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                  <h4 className="mb-1.5 flex items-center gap-1 text-xs font-bold tracking-wider text-indigo-700 uppercase dark:text-indigo-300">
                    <Sparkles className="size-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Official Advocacy</span>
                  </h4>
                  <p className="font-serif text-sm leading-relaxed text-slate-700 italic dark:text-slate-200">
                    &ldquo;{contestant.advocacy}&rdquo;
                  </p>
                </div>
              )}

              {/* Biography Details */}
              {contestant.bio && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    About Candidate
                  </span>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
                    {contestant.bio}
                  </p>
                </div>
              )}

              {/* Verified Social Media Channels */}
              {(contestant.instagramUrl || contestant.tiktokUrl || contestant.facebookUrl) && (
                <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Official Social Channels
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {contestant.instagramUrl && (
                      <a
                        href={contestant.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50/60 px-3 py-1.5 text-xs font-medium text-pink-700 transition-all hover:bg-pink-100 dark:border-pink-900/40 dark:bg-pink-950/30 dark:text-pink-300"
                      >
                        <InstagramIcon className="size-3.5" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {contestant.tiktokUrl && (
                      <a
                        href={contestant.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <span className="text-xs font-bold">TikTok</span>
                      </a>
                    )}
                    {contestant.facebookUrl && (
                      <a
                        href={contestant.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-1.5 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300"
                      >
                        <span className="text-xs font-bold">Facebook</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal CTA Bar */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Current Standing</span>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {contestant.voteCount.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    Votes
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onVoteClick) onVoteClick(contestant);
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95"
              >
                <Heart className="size-4 fill-white text-white" />
                <span>Vote for {contestant.name.split(" ")[0]}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
