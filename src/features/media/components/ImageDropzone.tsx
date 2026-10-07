'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, X, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ImageDropzoneProps } from '../types';
import { useImageUpload } from '../hooks/use-image-upload';

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
  className = '',
}: ImageDropzoneProps) {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || isUploading) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading && !isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Clear input so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    reset();
    onRemove?.();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
          {label}
        </label>
      )}

      {/* Screen Reader Live Announcements */}
      <div className="sr-only" aria-live="polite" role="status">
        {status === 'validating' && 'Validating selected image.'}
        {status === 'presigning' && 'Requesting secure upload authorization.'}
        {status === 'uploading' && `Uploading image: ${progressPercent}% complete.`}
        {status === 'success' && 'Image upload completed successfully.'}
        {status === 'error' && `Upload error: ${error?.message}`}
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="flex items-center justify-between border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200 rounded-none">
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
                  retryUpload();
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
      {previewUrl && status !== 'error' && (
        <div className="relative border border-slate-300 bg-white p-3 dark:border-slate-800 dark:bg-[#0d1424] rounded-none shadow-xs">
          <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Media preview"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              {status === 'success' && (
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
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 rounded-none transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-rose-950/40 rounded-none transition-colors"
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
        <div className="border border-sky-300 bg-sky-50/50 p-4 dark:border-sky-800 dark:bg-sky-950/20 rounded-none space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-900 dark:text-sky-200 font-heading uppercase tracking-wider">
              {status === 'validating' && 'Validating...'}
              {status === 'presigning' && 'Authorizing S3 Upload...'}
              {status === 'uploading' && 'Uploading directly to S3...'}
            </span>
            <span className="font-mono text-sky-800 dark:text-sky-300 font-bold">
              {progressPercent}%
            </span>
          </div>

          <div
            className="h-2 w-full overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-none border border-slate-300 dark:border-slate-700"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-sky-600 dark:bg-sky-500 transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>
              {totalBytes > 0
                ? `${formatBytes(loadedBytes)} of ${formatBytes(totalBytes)}`
                : ''}
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
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={label ? `Upload ${label}` : 'Upload image'}
          onClick={handleContainerClick}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group relative flex flex-col items-center justify-center p-8 text-center border-2 border-dashed transition-all cursor-pointer rounded-none
            ${
              isDragOver
                ? 'border-sky-600 bg-sky-50/50 dark:border-sky-400 dark:bg-sky-950/20'
                : 'border-slate-300 bg-slate-50/50 hover:border-sky-500 hover:bg-slate-100/50 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-sky-400 dark:hover:bg-slate-900/80'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
            focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600 dark:focus-visible:ring-sky-400
          `}
        >
          <div className="flex h-12 w-12 items-center justify-center border border-slate-300 bg-white text-slate-600 group-hover:border-sky-500 group-hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:border-sky-400 dark:group-hover:text-sky-300 transition-colors rounded-none">
            <UploadCloud className="h-6 w-6" />
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
              <span className="text-sky-600 dark:text-sky-400 underline">
                Click to browse
              </span>{' '}
              or drag & drop
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              JPEG, PNG, or WebP
            </p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedMimeTypes?.join(',') || 'image/jpeg,image/png,image/webp'}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Subtext / Guidance */}
      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
