"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, X, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ImageDropzoneProps } from "../types";
import { useImageUpload } from "../hooks/use-image-upload";

export function ImageDropzone({
  folder,
  maxSizeBytes,
  allowedMimeTypes,
  initialPreviewUrl,
  onUploadComplete,
  onError,
  onRemove,
  disabled = false,
  label,
  helperText,
  className = "",
}: Readonly<ImageDropzoneProps>) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    status,
    progressPercent,
    loadedBytes,
    totalBytes,
    previewUrl,
    error,
    isUploading,
    uploadFile,
    cancelUpload,
    retryUpload,
    reset,
  } = useImageUpload({
    folder,
    maxSizeBytes,
    allowedMimeTypes,
    initialPreviewUrl,
    onUploadComplete,
    onError,
  });

  const handleContainerClick = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || isUploading) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading && !isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
    // Clear input so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    reset();
    onRemove?.();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {label && (
        <label className="font-heading block text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-slate-100">
          {label}
        </label>
      )}

      {/* Screen Reader Live Announcements */}
      <div className="sr-only" aria-live="polite" role="status">
        {status === "validating" && "Validating selected image."}
        {status === "presigning" && "Requesting secure upload authorization."}
        {status === "uploading" && `Uploading image: ${progressPercent}% complete.`}
        {status === "success" && "Image upload completed successfully."}
        {status === "error" && `Upload error: ${error?.message}`}
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="flex items-center justify-between rounded-none border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error.message}</span>
          </div>
          <div className="flex items-center gap-2">
            {error.retryable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void retryUpload();
                }}
                className="flex items-center gap-1 font-bold text-rose-800 hover:underline dark:text-rose-300"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="p-1 hover:text-rose-950 dark:hover:text-white"
              aria-label="Dismiss error"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Preview Card View (When an image is uploaded or previewed) */}
      {previewUrl && status !== "error" && (
        <div className="relative rounded-none border border-slate-300 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
          <div className="relative aspect-video w-full overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Media preview" className="h-full w-full object-contain" />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              {status === "success" && (
                <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleContainerClick}
                disabled={disabled || isUploading}
                className="rounded-none border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold tracking-wider text-slate-900 uppercase transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="rounded-none border border-rose-300 bg-white px-3 py-1.5 text-xs font-bold tracking-wider text-rose-700 uppercase transition-colors hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
                aria-label="Remove image"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Bar (Visible while transferring) */}
      {isUploading && (
        <div className="space-y-2 rounded-none border border-sky-300 bg-sky-50/50 p-4 dark:border-sky-800 dark:bg-sky-950/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-heading font-bold tracking-wider text-sky-900 uppercase dark:text-sky-200">
              {status === "validating" && "Validating..."}
              {status === "presigning" && "Authorizing S3 Upload..."}
              {status === "uploading" && "Uploading directly to S3..."}
            </span>
            <span className="font-mono font-bold text-sky-800 dark:text-sky-300">
              {progressPercent}%
            </span>
          </div>

          <progress
            className="h-2 w-full appearance-none overflow-hidden rounded-none border border-slate-300 bg-slate-200 text-sky-600 transition-all duration-150 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-500 [&::-moz-progress-bar]:bg-sky-600 dark:[&::-moz-progress-bar]:bg-sky-500 [&::-webkit-progress-bar]:bg-slate-200 dark:[&::-webkit-progress-bar]:bg-slate-800 [&::-webkit-progress-value]:bg-sky-600 dark:[&::-webkit-progress-value]:bg-sky-500"
            value={progressPercent}
            max={100}
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Upload progress"
          />

          <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {totalBytes > 0 ? `${formatBytes(loadedBytes)} of ${formatBytes(totalBytes)}` : ""}
            </span>
            <button
              type="button"
              onClick={cancelUpload}
              className="font-sans font-bold text-rose-600 hover:underline dark:text-rose-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Dropzone Interactive Box (Visible when idle or not previewed) */}
      {!previewUrl && !isUploading && (
        <button
          type="button"
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          aria-label={label ? `Upload ${label}` : "Upload image"}
          onClick={handleContainerClick}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-none border-2 border-dashed p-8 text-center transition-all ${
            isDragOver
              ? "border-sky-600 bg-sky-50/50 dark:border-sky-400 dark:bg-sky-950/20"
              : "border-slate-300 bg-slate-50/50 hover:border-sky-500 hover:bg-slate-100/50 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-sky-400 dark:hover:bg-slate-900/80"
          } ${disabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""} focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:outline-hidden dark:focus-visible:ring-sky-400`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-none border border-slate-300 bg-white text-slate-600 transition-colors group-hover:border-sky-500 group-hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:border-sky-400 dark:group-hover:text-sky-300">
            <UploadCloud className="h-6 w-6" />
          </span>

          <span className="mt-4 block space-y-1">
            <span className="font-heading block text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-slate-100">
              <span className="text-sky-600 underline dark:text-sky-400">Click to browse</span> or
              drag & drop
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              JPEG, PNG, or WebP
            </span>
          </span>
        </button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedMimeTypes?.join(",") || "image/jpeg,image/png,image/webp"}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Subtext / Guidance */}
      {helperText && <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
}
