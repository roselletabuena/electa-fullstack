"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
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

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % photoItems.length);
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + photoItems.length) % photoItems.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, photoItems.length]);

  if (photoItems.length === 0) {
    return (
      <div className="relative flex aspect-4/5 w-full items-center justify-center rounded-none border border-slate-300 bg-slate-900 text-sm text-slate-500 dark:border-white/10">
        No gallery photos available
      </div>
    );
  }

  const activePhoto = photoItems[activeIndex] ?? photoItems[0];
  if (!activePhoto) return null;

  const isDataUrl = activePhoto.url.startsWith("data:");

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % photoItems.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + photoItems.length) % photoItems.length);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main 4:5 Active Photo Display */}
      <div className="group relative aspect-4/5 w-full overflow-hidden rounded-none border border-slate-300 bg-slate-950 shadow-2xl dark:border-white/10">
        <Image
          src={activePhoto.url}
          alt={`${candidateName} - Photo ${activeIndex + 1}`}
          fill
          unoptimized={isDataUrl}
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover transition-all duration-300"
          priority
        />

        {/* Counter Badge */}
        <div className="absolute top-3 right-3 rounded-none border border-white/20 bg-slate-950/80 px-3 py-1 font-mono text-xs font-medium text-slate-200 backdrop-blur-md">
          {activeIndex + 1} / {photoItems.length}
        </div>

        {/* Lightbox Trigger */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 left-3 rounded-none border border-white/20 bg-slate-950/80 p-2 text-slate-200 backdrop-blur-md transition-colors hover:border-sky-400/50 hover:text-sky-300"
          title="Fullscreen View"
          aria-label="Open Fullscreen Lightbox"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Navigation Arrows */}
        {photoItems.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-none border border-white/20 bg-slate-950/80 p-2 text-slate-200 opacity-80 backdrop-blur-md transition-all hover:bg-slate-900 hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-none border border-white/20 bg-slate-950/80 p-2 text-slate-200 opacity-80 backdrop-blur-md transition-all hover:bg-slate-900 hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation Strip */}
      {photoItems.length > 1 && (
        <div className="flex scrollbar-thin scrollbar-thumb-slate-300 gap-2 overflow-x-auto pt-0.5 pb-1 dark:scrollbar-thumb-slate-700">
          {photoItems.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-4/5 h-16 shrink-0 overflow-hidden rounded-none border transition-all ${
                idx === activeIndex
                  ? "scale-105 border-sky-600 opacity-100 ring-2 ring-sky-600/40"
                  : "border-slate-300 opacity-60 hover:opacity-90 dark:border-slate-800"
              }`}
            >
              <Image
                src={item.url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                unoptimized={item.url.startsWith("data:")}
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal via Portal */}
      {lightboxOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${candidateName} Fullscreen Lightbox`}
            className="animate-in fade-in fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-xl duration-200 sm:p-8"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-20 flex size-10 items-center justify-center rounded-none border border-white/20 bg-slate-900/80 text-white backdrop-blur-md transition hover:bg-white/20 hover:text-white"
              aria-label="Close fullscreen view"
            >
              <X className="size-6" />
            </button>

            {/* Counter Badge */}
            <div className="absolute top-4 left-4 z-20 rounded-none border border-white/20 bg-slate-900/80 px-3 py-1 font-mono text-xs font-semibold text-slate-200 backdrop-blur-md">
              {activeIndex + 1} / {photoItems.length}
            </div>

            {/* Main Fullscreen Image */}
            <div
              className="relative flex max-h-[88vh] max-w-[90vw] items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.url}
                alt={`${candidateName} - Fullscreen`}
                className="max-h-[85vh] max-w-[85vw] object-contain drop-shadow-2xl select-none"
              />
            </div>

            {/* Navigation Arrows in Lightbox */}
            {photoItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-none border border-white/20 bg-slate-900/80 p-3 text-white backdrop-blur-md transition hover:bg-slate-800"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-none border border-white/20 bg-slate-900/80 p-3 text-white backdrop-blur-md transition hover:bg-slate-800"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};
