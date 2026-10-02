"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export interface FilterOption {
  id: string;
  name: string;
}

export interface CategoryFilterTabsProps {
  divisions: FilterOption[];
  categories: FilterOption[];
  selectedDivisionId?: string | null | undefined;
  selectedCategoryId?: string | null | undefined;
}

export function CategoryFilterTabs({
  divisions,
  categories,
  selectedDivisionId,
  selectedCategoryId,
}: CategoryFilterTabsProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelectDivision = (divisionId?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (divisionId) {
      params.set("divisionId", divisionId);
    } else {
      params.delete("divisionId");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectCategory = (categoryId?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Divisions / Track Tabs */}
      {divisions.length > 0 && (
        <div>
          <span className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Division Track
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSelectDivision(undefined)}
              className={`font-heading px-3 py-1.5 text-xs font-extrabold tracking-wider uppercase transition-all ${
                !selectedDivisionId
                  ? "border border-slate-900 bg-slate-900 text-white shadow-xs dark:border-white dark:bg-white dark:text-slate-950"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
              }`}
            >
              All Divisions
            </button>
            {divisions.map((div) => {
              const isSelected = selectedDivisionId === div.id;
              return (
                <button
                  key={div.id}
                  type="button"
                  onClick={() => handleSelectDivision(div.id)}
                  className={`font-heading px-3 py-1.5 text-xs font-extrabold tracking-wider uppercase transition-all ${
                    isSelected
                      ? "border border-slate-900 bg-slate-900 text-white shadow-xs dark:border-white dark:bg-white dark:text-slate-950"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
                  }`}
                >
                  {div.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Specialized Award Categories */}
      {categories.length > 0 && (
        <div>
          <span className="mb-1.5 block font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Award Title / Track
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSelectCategory(undefined)}
              className={`font-heading px-3 py-1.5 text-xs font-extrabold tracking-wider uppercase transition-all ${
                !selectedCategoryId
                  ? "border border-sky-600 bg-sky-600 text-white shadow-xs dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
              }`}
            >
              Overall Coronation
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`font-heading px-3 py-1.5 text-xs font-extrabold tracking-wider uppercase transition-all ${
                    isSelected
                      ? "border border-sky-600 bg-sky-600 text-white shadow-xs dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
