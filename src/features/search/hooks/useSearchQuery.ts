"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useQueryState, parseAsString } from "nuqs";

export interface UseSearchQueryOptions {
  readonly debounceMs?: number | undefined;
  readonly onSearch?: ((query: string) => void) | undefined;
  readonly onClear?: (() => void) | undefined;
  readonly scrollTargetId?: string | undefined;
}

export interface UseSearchQueryReturn {
  readonly inputValue: string;
  readonly debouncedQuery: string;
  readonly isPending: boolean;
  readonly isDebouncing: boolean;
  readonly setInputValue: (value: string) => void;
  readonly submitQuery: () => void;
  readonly clearQuery: () => void;
}

export function useSearchQuery(options: UseSearchQueryOptions = {}): UseSearchQueryReturn {
  const { debounceMs = 300, onSearch, onClear, scrollTargetId } = options;
  const [isPending, startTransition] = useTransition();

  const [urlQuery, setUrlQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      shallow: true,
      history: "push",
      startTransition,
    }),
  );

  const [localQuery, setLocalQuery] = useState<string | null>(null);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived input value: uses local typed string while typing, falls back to URL query
  const inputValue = localQuery ?? urlQuery;

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const smoothScrollToTarget = useCallback(() => {
    if (!scrollTargetId || typeof window === "undefined") {
      return;
    }
    const target = document.getElementById(scrollTargetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [scrollTargetId]);

  const setInputValue = useCallback(
    (value: string) => {
      setLocalQuery(value);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setIsDebouncing(true);
      timerRef.current = setTimeout(() => {
        setIsDebouncing(false);
        const trimmed = value.trim();
        setUrlQuery(trimmed || null);
        setLocalQuery(null);
        if (trimmed && onSearch) {
          onSearch(trimmed);
        }
      }, debounceMs);
    },
    [debounceMs, onSearch, setUrlQuery],
  );

  const submitQuery = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsDebouncing(false);
    const trimmed = inputValue.trim();
    setLocalQuery(null);
    setUrlQuery(trimmed || null);
    if (trimmed && onSearch) {
      onSearch(trimmed);
    }
    smoothScrollToTarget();
  }, [inputValue, onSearch, setUrlQuery, smoothScrollToTarget]);

  const clearQuery = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsDebouncing(false);
    setLocalQuery(null);
    setUrlQuery(null);
    if (onClear) {
      onClear();
    }
  }, [onClear, setUrlQuery]);

  return {
    inputValue,
    debouncedQuery: urlQuery,
    isPending,
    isDebouncing,
    setInputValue,
    submitQuery,
    clearQuery,
  };
}
