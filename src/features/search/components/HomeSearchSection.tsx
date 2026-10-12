"use client";

import React, { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlobalSearchBar } from "./GlobalSearchBar";
import { SearchResultsView } from "./SearchResultsView";
import { useSearchQuery } from "../hooks/useSearchQuery";
import type { SearchResultsDto } from "../types";
import type { ApiResponse } from "@/lib/api/response";

function HomeSearchInner() {
  const { debouncedQuery, clearQuery } = useSearchQuery();

  const { data: searchResponse, isLoading } = useQuery<ApiResponse<SearchResultsDto>>({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) {
        return {
          success: true,
          data: {
            query: "",
            events: [],
            contestants: [],
            categories: [],
            totalMatches: 0,
          },
          timestamp: new Date().toISOString(),
        };
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) {
        throw new Error("Search request failed");
      }
      return res.json() as Promise<ApiResponse<SearchResultsDto>>;
    },
    enabled: Boolean(debouncedQuery),
    staleTime: 1000 * 60, // 1 minute
  });

  return (
    <div className="relative w-full max-w-3xl">
      <GlobalSearchBar
        size="large"
        placeholder="Search pageants, campus elections, or candidates..."
        scrollTargetId="search-results"
      />

      {debouncedQuery && (
        <div className="scrollbar-themed absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-x-hidden overflow-y-auto overscroll-contain border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0d1424]">
          <SearchResultsView
            results={searchResponse?.data ?? null}
            isLoading={isLoading}
            onClearQuery={clearQuery}
            className="border-none shadow-none"
          />
        </div>
      )}
    </div>
  );
}

export function HomeSearchSection() {
  return (
    <Suspense
      fallback={
        <div className="h-14 w-full max-w-3xl animate-pulse border border-slate-300 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50" />
      }
    >
      <HomeSearchInner />
    </Suspense>
  );
}
