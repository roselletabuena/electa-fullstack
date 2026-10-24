"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { ContestantMediaDto } from "../types";
import { useEventTheme } from "@/features/events/theme";

interface PhotoGalleryCarouselProps {
  media: ContestantMediaDto[];
  candidateName: string;
}

export const PhotoGalleryCarousel: React.FC<PhotoGalleryCarouselProps> = ({
  media,
  candidateName,
}) => {
  const { themeSlug } = useEventTheme();
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
      <div className="carousel-main-display relative flex aspect-4/5 w-full items-center justify-center rounded-none border border-slate-300 bg-slate-900 text-sm text-slate-500 dark:border-white/10">
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
      <div className="carousel-main-display group relative aspect-4/5 w-full overflow-hidden rounded-none border border-slate-300 bg-slate-950 shadow-2xl dark:border-white/10">
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
        <div className="carousel-counter-badge absolute top-3 right-3 rounded-none border border-white/20 bg-slate-950/80 px-3 py-1 font-mono text-xs font-medium text-slate-200 backdrop-blur-md">
          {activeIndex + 1} / {photoItems.length}
        </div>

        {/* Lightbox Trigger */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="carousel-expand-btn absolute top-3 left-3 rounded-none border border-white/20 bg-slate-950/80 p-2 text-slate-200 backdrop-blur-md transition-colors hover:border-amber-400/50 hover:text-amber-300"
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
              className="carousel-nav-btn carousel-nav-prev absolute top-1/2 left-2 -translate-y-1/2 rounded-none border border-white/20 bg-slate-950/80 p-2 text-slate-200 opacity-80 backdrop-blur-md transition-all hover:bg-slate-900 hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="carousel-nav-btn carousel-nav-next absolute top-1/2 right-2 -translate-y-1/2 rounded-none border border-white/20 bg-slate-950/80 p-2 text-slate-200 opacity-80 backdrop-blur-md transition-all hover:bg-slate-900 hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation Strip */}
      {photoItems.length > 1 && (
        <div className="carousel-thumbnail-strip flex scrollbar-thin scrollbar-thumb-slate-300 gap-2 overflow-x-auto pt-0.5 pb-1 dark:scrollbar-thumb-slate-700">
          {photoItems.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`carousel-thumb-btn relative aspect-4/5 h-16 shrink-0 overflow-hidden rounded-none border transition-all ${
                idx === activeIndex
                  ? "active scale-105 border-amber-600 opacity-100 ring-2 ring-amber-600/40"
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
          <dialog
            open
            aria-modal="true"
            aria-label={`${candidateName} Fullscreen Lightbox`}
            data-event-theme={themeSlug}
            className="carousel-lightbox-dialog animate-in fade-in fixed inset-0 z-9999 m-0 flex h-full max-h-none w-full max-w-none flex-col items-center justify-between border-none bg-slate-950/95 p-4 backdrop-blur-2xl duration-200 sm:p-6"
          >
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close fullscreen view"
              onClick={() => setLightboxOpen(false)}
              className="carousel-lightbox-backdrop fixed inset-0 cursor-default border-none bg-transparent"
            />

            {/* Top Editorial Header Bar */}
            <header className="carousel-lightbox-header relative z-30 flex w-full max-w-6xl items-center justify-between gap-4 py-1">
              <div className="carousel-lightbox-title-area flex flex-col">
                <span className="carousel-lightbox-eyebrow text-[10px] font-bold tracking-widest text-sky-400 uppercase">
                  Official Candidate Gallery
                </span>
                <h3 className="carousel-lightbox-candidate-name font-heading text-lg font-bold tracking-wide text-white sm:text-xl">
                  {candidateName}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {/* Counter Badge */}
                <div className="carousel-lightbox-counter-badge flex items-center gap-1 rounded-none border border-white/20 bg-slate-900/80 px-3 py-1 font-mono text-xs font-semibold text-slate-200 backdrop-blur-md">
                  <span>{activeIndex + 1}</span>
                  <span className="opacity-50">/</span>
                  <span>{photoItems.length}</span>
                </div>

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="carousel-lightbox-close-btn flex size-9 items-center justify-center rounded-none border border-white/20 bg-slate-900/80 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
                  aria-label="Close fullscreen view"
                  title="Close (Esc)"
                >
                  <X className="size-5" />
                </button>
              </div>
            </header>

            {/* Main Fullscreen Image Area with Nav Controls */}
            <div className="relative z-10 my-auto flex max-h-[75vh] w-full max-w-5xl items-center justify-center">
              {/* Previous Arrow */}
              {photoItems.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="carousel-lightbox-nav-btn carousel-lightbox-nav-prev absolute left-0 z-20 flex size-11 -translate-x-2 items-center justify-center rounded-none border border-white/20 bg-slate-900/80 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-800 sm:-translate-x-6"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-6" />
                </button>
              )}

              {/* Framed Image Container */}
              <div className="carousel-lightbox-image-frame relative flex max-h-[72vh] max-w-[85vw] items-center justify-center overflow-hidden rounded-none border border-white/15 bg-black/40 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePhoto.url}
                  alt={`${candidateName} - Fullscreen`}
                  className="max-h-[70vh] max-w-[82vw] object-contain select-none"
                />
              </div>

              {/* Next Arrow */}
              {photoItems.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="carousel-lightbox-nav-btn carousel-lightbox-nav-next absolute right-0 z-20 flex size-11 translate-x-2 items-center justify-center rounded-none border border-white/20 bg-slate-900/80 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-800 sm:translate-x-6"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-6" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Strip (if multiple photos) */}
            {photoItems.length > 1 ? (
              <footer className="carousel-lightbox-thumb-strip relative z-30 flex max-w-full items-center gap-2 overflow-x-auto rounded-none border border-white/10 bg-slate-900/60 p-2 backdrop-blur-md">
                {photoItems.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`carousel-lightbox-thumb-item relative aspect-4/5 h-14 shrink-0 overflow-hidden rounded-none border transition-all ${
                      idx === activeIndex
                        ? "active scale-105 border-amber-500 ring-2 ring-amber-500/40"
                        : "border-white/20 opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <Image
                      src={item.url}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      unoptimized={item.url.startsWith("data:")}
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </footer>
            ) : (
              <div className="h-6" aria-hidden="true" />
            )}
          </dialog>,
          document.body,
        )}
    </div>
  );
};
