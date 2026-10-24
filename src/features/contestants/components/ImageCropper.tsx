"use client";

import React, { useRef, useState } from "react";
import { Upload, Check, RefreshCw, X } from "lucide-react";

interface ImageCropperProps {
  onCropComplete: (croppedDataUrl: string) => void;
  aspectRatio?: number; // width / height, defaults to 4/5 = 0.8
  compact?: boolean;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  onCropComplete,
  aspectRatio = 4 / 5,
  compact = false,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropAndSave = () => {
    if (!imageRef.current) return;
    setIsProcessing(true);

    try {
      const img = imageRef.current;
      const canvas = document.createElement("canvas");
      const targetWidth = 800;
      const targetHeight = Math.round(targetWidth / aspectRatio); // 1000px for 4:5

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context not available");

      // Center-crop to 4:5
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let sourceWidth = img.naturalWidth;
      let sourceHeight = img.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;

      if (imgAspect > aspectRatio) {
        // Image is wider than 4:5 -> crop width
        sourceWidth = img.naturalHeight * aspectRatio;
        sourceX = (img.naturalWidth - sourceWidth) / 2;
      } else {
        // Image is taller than 4:5 -> crop height
        sourceHeight = img.naturalWidth / aspectRatio;
        sourceY = (img.naturalHeight - sourceHeight) / 2;
      }

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        targetWidth,
        targetHeight,
      );

      // Export as modern WebP
      const croppedDataUrl = canvas.toDataURL("image/webp", 0.9);
      onCropComplete(croppedDataUrl);
      setImageSrc(null);
    } catch (err) {
      console.error("Failed to crop image:", err);
      alert("Could not crop the selected image.");
    } finally {
      setIsProcessing(false);
    }
  };

  let uploadButton: React.ReactNode = null;
  if (!imageSrc) {
    uploadButton = compact ? (
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-none border-2 border-dashed border-slate-300 bg-slate-50/70 p-3 text-center transition-all hover:border-sky-500 hover:bg-sky-50/40 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-sky-500/50 dark:hover:bg-sky-950/20"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-none bg-sky-50 text-sky-600 transition-transform group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400">
          <Upload className="h-4 w-4" />
        </div>
        <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">Add Photo</span>
        <span className="mt-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
          4:5 Ratio
        </span>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group flex aspect-4/5 max-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-none border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center transition-all hover:border-sky-500 hover:bg-sky-50/40 sm:max-h-72 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-sky-500/50 dark:hover:bg-sky-950/20"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-none bg-sky-50 text-sky-600 transition-transform group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400">
          <Upload className="h-6 w-6" />
        </div>
        <span className="mt-3 text-xs font-bold tracking-wider text-slate-800 uppercase dark:text-slate-200">
          Upload & Crop Portrait
        </span>
        <span className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Enforces 4:5 vertical portrait aspect ratio (WebP output)
        </span>
        <span className="mt-2 inline-flex items-center rounded-none border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          JPG, PNG, WebP up to 10MB
        </span>
      </button>
    );
  }

  return (
    <div className={compact ? "aspect-4/5 w-full" : "flex w-full flex-col gap-3"}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploadButton}

      {imageSrc &&
        (compact ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-3 backdrop-blur-xs sm:p-4">
            <div className="relative flex max-h-[92vh] w-full max-w-sm flex-col overflow-hidden rounded-none border border-slate-300 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-heading text-xs font-bold tracking-wider text-slate-800 uppercase dark:text-slate-200">
                  Crop Portrait (4:5 Ratio)
                </h4>
                <button
                  type="button"
                  onClick={() => setImageSrc(null)}
                  className="rounded-none p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative mx-auto aspect-4/5 w-full max-w-xs overflow-hidden rounded-none border-2 border-sky-500/60 bg-slate-950 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop Preview"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 border border-dashed border-sky-400/80" />
                <div className="absolute bottom-2 left-2 rounded-none bg-slate-900/90 px-2 py-0.5 font-mono text-[10px] font-medium text-sky-300">
                  4:5 Frame (800×1000)
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setImageSrc(null)}
                  className="rounded-none border border-slate-300 bg-white px-3 py-2 text-xs font-bold tracking-wider text-slate-700 uppercase hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCropAndSave}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Apply Crop</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="relative aspect-4/5 max-h-80 w-full max-w-xs overflow-hidden rounded-none border-2 border-sky-500/60 bg-slate-950 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop Preview"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 border border-dashed border-sky-400/80" />
              <div className="absolute bottom-2 left-2 rounded-none bg-slate-900/90 px-2 py-0.5 font-mono text-[10px] font-medium text-sky-300">
                4:5 Frame (800×1000)
              </div>
            </div>

            <div className="flex w-full max-w-xs items-center gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCropAndSave}
                className="btn-primary flex flex-1 items-center justify-center gap-1.5 px-4 py-2 text-xs disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>Apply 4:5 Crop</span>
              </button>
              <button
                type="button"
                onClick={() => setImageSrc(null)}
                className="rounded-none border border-slate-300 bg-white px-3 py-2 text-xs font-bold tracking-wider text-slate-700 uppercase hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};
