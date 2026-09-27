"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import type { ContestantMediaDto } from "../types";

interface PhotoGalleryCarouselProps {
  media: ContestantMediaDto[];
  candidateName: string;
}

export const PhotoGalleryCarousel: React.FC<PhotoGalleryCarouselProps> = ({
  media,
  candidateName,
}) => {
  const photoItems = media.filter((m) => m.mediaType === "PHOTO");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (photoItems.length === 0) {
    return (
      <div className="relative flex aspect-4/5 w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-sm text-slate-500">
        No gallery photos available
      </div>
    );
  }

  const activePhoto = photoItems[activeIndex] ?? photoItems[0];
  if (!activePhoto) return null;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % photoItems.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + photoItems.length) % photoItems.length);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main 4:5 Active Photo Display */}
      <div className="group relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
        <Image
          src={activePhoto.url}
          alt={`${candidateName} - Photo ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover transition-all duration-300"
          priority
        />

        {/* Counter Badge */}
        <div className="absolute top-3 right-3 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 font-mono text-xs font-medium text-slate-200 backdrop-blur-md">
          {activeIndex + 1} / {photoItems.length}
        </div>

        {/* Lightbox Trigger */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 left-3 rounded-full border border-white/10 bg-slate-950/70 p-2 text-slate-200 backdrop-blur-md transition-colors hover:border-indigo-400/50 hover:text-indigo-300"
          title="Fullscreen View"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Navigation Arrows */}
        {photoItems.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/70 p-2 text-slate-200 opacity-80 backdrop-blur-md transition-all hover:bg-slate-900 hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/70 p-2 text-slate-200 opacity-80 backdrop-blur-md transition-all hover:bg-slate-900 hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation Strip (up to 10 photos) */}
      {photoItems.length > 1 && (
        <div className="flex scrollbar-thin scrollbar-thumb-slate-300 gap-2 overflow-x-auto pt-0.5 pb-1 dark:scrollbar-thumb-slate-700">
          {photoItems.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-4/5 h-16 shrink-0 overflow-hidden rounded-lg border transition-all ${
                idx === activeIndex
                  ? "scale-105 border-indigo-600 opacity-100 ring-2 ring-indigo-600/40"
                  : "border-slate-200 opacity-60 hover:opacity-90 dark:border-slate-800"
              }`}
            >
              <Image
                src={item.url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-slate-950/95 p-4 backdrop-blur-xl"
        >
          <div className="relative aspect-4/5 h-auto max-h-[90vh] w-auto max-w-[90vw]">
            <Image
              src={activePhoto.url}
              alt={`${candidateName} - Fullscreen`}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
};
