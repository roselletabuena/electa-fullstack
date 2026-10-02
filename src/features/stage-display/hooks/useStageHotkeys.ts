"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface StageHotkeyOptions {
  onNext?: () => void;
  onPrev?: () => void;
  onReset?: () => void;
  onToggleMute?: () => void;
  onToggleMode?: () => void;
  enabled?: boolean;
}

export function useStageHotkeys({
  onNext,
  onPrev,
  onReset,
  onToggleMute,
  onToggleMode,
  enabled = true,
}: StageHotkeyOptions) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    setIsControlsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 4000);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen might be blocked or unsupported in iframe
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      resetHideTimer();

      // Don't trigger shortcuts if typing inside an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case "f":
        case "F":
          e.preventDefault();
          void toggleFullscreen();
          break;
        case " ":
        case "ArrowRight":
          e.preventDefault();
          onNext?.();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onPrev?.();
          break;
        case "r":
        case "R":
          e.preventDefault();
          onReset?.();
          break;
        case "m":
        case "M":
          e.preventDefault();
          onToggleMute?.();
          break;
        case "t":
        case "T":
          e.preventDefault();
          onToggleMode?.();
          break;
      }
    };

    const handleMouseMove = () => {
      resetHideTimer();
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [
    enabled,
    onNext,
    onPrev,
    onReset,
    onToggleMute,
    onToggleMode,
    resetHideTimer,
    toggleFullscreen,
  ]);

  // Initialise the hide timer once on mount (separate effect avoids setState-in-effect lint)
  useEffect(() => {
    if (!enabled) return;
    const id = setTimeout(() => {
      setIsControlsVisible(false);
    }, 4000);
    return () => clearTimeout(id);
  }, [enabled]);

  return {
    isFullscreen,
    isControlsVisible,
    toggleFullscreen,
    resetHideTimer,
  };
}
