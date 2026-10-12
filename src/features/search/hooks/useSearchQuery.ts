"use client";

import { useState, useEffect, useRef, useTransition, useCallback, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";

export interface UseSearchQueryOptions {
  readonly debounceMs?: number;
  readonly onSearch?: (query: string) => void;
  readonly onClear?: () => void;
  readonly scrollTargetId?: string;
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

  const parser = useMemo(
    () =>
      parseAsString.withDefault("").withOptions({
        shallow: true,
        history: "push",
        startTransition,
      }),
    [startTransition],
  );

  const [urlQuery, setUrlQuery] = useQueryState("q", parser);

  const [localQuery, setLocalQuery] = useState<string | null>(null);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callback refs fresh without re-triggering callbacks
  const onSearchRef = useRef(onSearch);
  const onClearRef = useRef(onClear);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    onClearRef.current = onClear;
  }, [onClear]);

  // Derived input value: uses local typed string while typing, falls back to URL query
  const inputValue = localQuery ?? urlQuery;

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const smoothScrollToTarget = useCallback(() => {
    if (!scrollTargetId || typeof window === "undefined") {
      return;
    }
    const target = document.getElementById(scrollTargetId);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollTargetId]);

  const setInputValue = useCallback(
    (value: string) => {
      setLocalQuery(value);

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      setIsDebouncing(true);
      timerRef.current = setTimeout(() => {
        setIsDebouncing(false);
        const trimmed = value.trim();
        void setUrlQuery(trimmed || null);
        setLocalQuery(null);
        if (trimmed) {
          onSearchRef.current?.(trimmed);
        }
      }, debounceMs);
    },
    [debounceMs, setUrlQuery],
  );

  const submitQuery = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsDebouncing(false);
    const trimmed = inputValue.trim();
    setLocalQuery(null);
    void setUrlQuery(trimmed || null);
    if (trimmed) {
      onSearchRef.current?.(trimmed);
    }
    smoothScrollToTarget();
  }, [inputValue, setUrlQuery, smoothScrollToTarget]);

  const clearQuery = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsDebouncing(false);
    setLocalQuery(null);
    void setUrlQuery(null);
    onClearRef.current?.();
  }, [setUrlQuery]);

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
