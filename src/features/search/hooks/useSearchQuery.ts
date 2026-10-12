"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useQueryState, parseAsString } from "nuqs";

export interface UseSearchQueryOptions {
  debounceMs?: number | undefined;
  onSearch?: ((query: string) => void) | undefined;
  onClear?: (() => void) | undefined;
  scrollTargetId?: string | undefined;
}

export interface UseSearchQueryReturn {
  inputValue: string;
  debouncedQuery: string;
  isPending: boolean;
  isDebouncing: boolean;
  setInputValue: (value: string) => void;
  submitQuery: () => void;
  clearQuery: () => void;
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

  const [inputValue, setInputValueState] = useState<string>(urlQuery);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [prevUrlQuery, setPrevUrlQuery] = useState<string>(urlQuery);

  // Sync external URL changes back to local input state during render
  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery);
    setInputValueState(urlQuery);
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const smoothScrollToTarget = useCallback(() => {
    if (!scrollTargetId || typeof window === "undefined") return;
    const target = document.getElementById(scrollTargetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [scrollTargetId]);

  const setInputValue = useCallback(
    (value: string) => {
      setInputValueState(value);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setIsDebouncing(true);
      timerRef.current = setTimeout(() => {
        setIsDebouncing(false);
        const trimmed = value.trim();
        setUrlQuery(trimmed || null);
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
    setInputValueState("");
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
