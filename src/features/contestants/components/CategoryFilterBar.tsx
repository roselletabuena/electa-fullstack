"use client";

import React from "react";
import { Award, Users } from "lucide-react";
import type { AwardCategoryDto } from "../types";

export interface CategoryFilterDivision {
  label: string;
  value: string;
}

interface CategoryFilterBarProps {
  divisions?: CategoryFilterDivision[] | undefined;
  selectedDivision: string;
  onSelectDivision: (division: string) => void;
  categories: AwardCategoryDto[];
  selectedCategoryId: string | "ALL";
  onSelectCategory: (categoryId: string | "ALL") => void;
}

const DEFAULT_FALLBACK_DIVISIONS: CategoryFilterDivision[] = [
  { label: "Female", value: "FEMALE" },
  { label: "Male", value: "MALE" },
  { label: "LGBTQ+", value: "LGBTQ" },
  { label: "Teen", value: "TEEN" },
];

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  divisions,
  selectedDivision,
  onSelectDivision,
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const activeDivisions: CategoryFilterDivision[] = [
    { label: "All Candidates", value: "ALL" },
    ...(divisions && divisions.length > 0 ? divisions : DEFAULT_FALLBACK_DIVISIONS),
  ];

  return (
    <div className="flex flex-col gap-3 py-4">
      {/* Primary Division Pill Tabs */}
      <div
        role="group"
        aria-label="Competition Divisions"
        className="flex flex-wrap items-center gap-2 pb-1"
      >
        <div className="mr-1 flex shrink-0 items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
          <Users className="size-3.5 text-sky-600 dark:text-sky-400" />
          <span>Division:</span>
        </div>
        {activeDivisions.map((div) => {
          const isSelected =
            selectedDivision === div.value ||
            (selectedDivision !== "ALL" &&
              selectedDivision.toLowerCase() === div.value.toLowerCase());
          return (
            <button
              key={div.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectDivision(div.value)}
              className={`rounded-none px-4 py-1.5 text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-slate-900 ${
                isSelected
                  ? "border border-sky-600 bg-sky-600 text-white shadow-xs dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950 font-bold"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {div.label}
            </button>
          );
        })}
      </div>

      {/* Award Category Filter Track */}
      {categories.length > 0 && (
        <div
          role="group"
          aria-label="Award Tracks"
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          <div className="mr-1 flex shrink-0 items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
            <Award className="size-3.5 text-sky-600 dark:text-sky-400" />
            <span>Award Track:</span>
          </div>
          <button
            type="button"
            aria-pressed={selectedCategoryId === "ALL"}
            onClick={() => onSelectCategory("ALL")}
            className={`rounded-none px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-slate-900 ${
              selectedCategoryId === "ALL"
                ? "border border-sky-600 bg-sky-600 text-white shadow-xs dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950 font-bold"
                : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            All Awards
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectCategory(cat.id)}
                className={`rounded-none px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-slate-900 ${
                  isSelected
                    ? "border border-sky-600 bg-sky-600 text-white shadow-xs dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950 font-bold"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
