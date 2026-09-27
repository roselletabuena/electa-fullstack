"use client";

import React, { useRef, useState } from "react";
import { Upload, Check, RefreshCw } from "lucide-react";

interface ImageCropperProps {
  onCropComplete: (croppedDataUrl: string) => void;
  aspectRatio?: number; // width / height, defaults to 4/5 = 0.8
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  onCropComplete,
  aspectRatio = 4 / 5,
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

  return (
    <div className="flex w-full flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {!imageSrc ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex aspect-4/5 max-h-56 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 text-center transition-all hover:border-indigo-500 hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/20"
        >
          <Upload className="mb-2 h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Upload & Crop Portrait
          </span>
          <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Enforces 4:5 vertical portrait aspect ratio (WebP output)
          </span>
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="relative aspect-4/5 max-h-80 w-full overflow-hidden rounded-xl border border-indigo-500/40 bg-slate-950 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop Preview"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-indigo-400 opacity-60" />
            <div className="absolute bottom-2 left-2 rounded-md bg-slate-900/90 px-2 py-0.5 font-mono text-[10px] font-medium text-indigo-300">
              4:5 Portrait Frame (800×1000)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleCropAndSave}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 disabled:opacity-50"
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
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
