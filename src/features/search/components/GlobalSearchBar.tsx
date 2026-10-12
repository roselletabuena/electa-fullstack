"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSearchQuery, type UseSearchQueryOptions } from "../hooks/useSearchQuery";
import { SearchInput } from "./SearchInput";
import type { GlobalSearchBarProps } from "../types";

export function GlobalSearchBar({
  className,
  placeholder = "Search events, pageants, and contestants...",
  onSearch,
  onClear,
  scrollTargetId = "search-results",
  ariaLabel = "Global event and candidate search",
  size = "default",
}: Readonly<GlobalSearchBarProps>) {
  const queryOptions = useMemo<UseSearchQueryOptions>(() => {
    const opts: UseSearchQueryOptions = { debounceMs: 300 };
    if (onSearch) {
      return {
        ...opts,
        onSearch,
        ...(onClear && { onClear }),
        ...(scrollTargetId && { scrollTargetId }),
      };
    }
    if (onClear) {
      return { ...opts, onClear, ...(scrollTargetId && { scrollTargetId }) };
    }
    if (scrollTargetId) {
      return { ...opts, scrollTargetId };
    }
    return opts;
  }, [onSearch, onClear, scrollTargetId]);

  const {
    inputValue,
    debouncedQuery,
    isPending,
    isDebouncing,
    setInputValue,
    submitQuery,
    clearQuery,
  } = useSearchQuery(queryOptions);

  const buttonSizeClasses = {
    compact: "h-9 px-3 text-[10px]",
    default: "h-11 px-5 text-xs",
    large: "h-14 px-7 text-sm",
  };

  return (
    <form
      role="search"
      aria-label={ariaLabel}
      onSubmit={(e) => {
        e.preventDefault();
        submitQuery();
      }}
      className={cn("flex w-full items-stretch gap-0", className)}
    >
      <div className="relative flex-1">
        <SearchInput
          value={inputValue}
          onChange={setInputValue}
          onClear={clearQuery}
          onSubmit={submitQuery}
          placeholder={placeholder}
          inputSize={size}
          aria-label={ariaLabel}
        />
      </div>

      <button
        type="submit"
        aria-label="Submit search query"
        disabled={isPending}
        className={cn(
          "font-heading inline-flex cursor-pointer items-center justify-center rounded-none border border-l-0 border-slate-900 bg-slate-900 font-extrabold tracking-widest text-white uppercase shadow-xs transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-sky-600 active:translate-y-0 disabled:opacity-50 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:outline-sky-400",
          buttonSizeClasses[size],
        )}
      >
        {isPending || isDebouncing ? "SEARCHING..." : "SEARCH"}
      </button>

      {/* Screen reader live region announcing active search status */}
      <span className="sr-only" aria-live="polite">
        {debouncedQuery ? `Filtering results for query ${debouncedQuery}` : "Search is empty"}
      </span>
    </form>
  );
}
