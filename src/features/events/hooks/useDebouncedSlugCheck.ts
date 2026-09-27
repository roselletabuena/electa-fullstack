"use client";

import { useEffect, useState } from "react";
import { RESERVED_SLUGS, slugRegex } from "@/lib/validations/event";
import type { ApiResponse } from "@/lib/api/response";
import type { CheckSlugResult, SlugAvailabilityStatus, SlugValidationState } from "../types";

export interface UseDebouncedSlugCheckReturn extends SlugValidationState {
  isChecking: boolean;
  isAvailable: boolean;
}

function getSyncValidation(trimmedSlug: string): SlugValidationState | null {
  if (!trimmedSlug) {
    return { status: "idle" };
  }

  if (trimmedSlug.length < 3 || trimmedSlug.length > 60 || !slugRegex.test(trimmedSlug)) {
    return {
      status: "invalid",
      message: "Slug must be 3-60 lowercase alphanumeric characters and single hyphens",
    };
  }

  if (RESERVED_SLUGS.includes(trimmedSlug as (typeof RESERVED_SLUGS)[number])) {
    return {
      status: "reserved",
      message: "This slug is reserved by the system and cannot be used",
    };
  }

  return null;
}

export function useDebouncedSlugCheck(slug: string, debounceMs = 300): UseDebouncedSlugCheckReturn {
  const trimmed = slug?.trim().toLowerCase() ?? "";
  const syncValidation = getSyncValidation(trimmed);

  const [asyncResult, setAsyncResult] = useState<{
    slug: string;
    state: SlugValidationState;
  }>({
    slug: "",
    state: { status: "idle" },
  });

  useEffect(() => {
    if (syncValidation !== null) {
      return;
    }

    const abortController = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/events/check-slug?slug=${encodeURIComponent(trimmed)}`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          const json = (await response.json()) as ApiResponse<CheckSlugResult>;
          setAsyncResult({
            slug: trimmed,
            state: {
              status: "unavailable",
              message: json.error || "Slug is not available",
            },
          });
          return;
        }

        const json = (await response.json()) as ApiResponse<CheckSlugResult>;
        if (json.success && json.data) {
          if (json.data.available) {
            setAsyncResult({
              slug: trimmed,
              state: {
                status: "available",
                message: "Slug is available",
              },
            });
          } else if (json.data.reason === "RESERVED") {
            setAsyncResult({
              slug: trimmed,
              state: {
                status: "reserved",
                message: "This slug is reserved by the system and cannot be used",
              },
            });
          } else {
            setAsyncResult({
              slug: trimmed,
              state: {
                status: "unavailable",
                message: "This URL slug is already taken",
              },
            });
          }
        } else {
          setAsyncResult({
            slug: trimmed,
            state: {
              status: "unavailable",
              message: json.error || "Slug is not available",
            },
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setAsyncResult({
          slug: trimmed,
          state: {
            status: "idle",
            message: "Unable to verify slug availability",
          },
        });
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [trimmed, debounceMs, syncValidation]);

  let currentStatus: SlugAvailabilityStatus;
  let currentMessage: string | undefined;

  if (syncValidation !== null) {
    currentStatus = syncValidation.status;
    currentMessage = syncValidation.message;
  } else if (asyncResult.slug === trimmed) {
    currentStatus = asyncResult.state.status;
    currentMessage = asyncResult.state.message;
  } else {
    currentStatus = "checking";
    currentMessage = "Checking availability...";
  }

  return {
    status: currentStatus,
    message: currentMessage,
    isChecking: currentStatus === "checking",
    isAvailable: currentStatus === "available",
  };
}
