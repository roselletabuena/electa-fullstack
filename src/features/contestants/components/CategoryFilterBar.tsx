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
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <div className="mr-1 flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Users className="size-3.5 text-indigo-600 dark:text-indigo-400" />
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
              onClick={() => onSelectDivision(div.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-indigo-600 font-bold text-white shadow-xs dark:bg-indigo-600"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {div.label}
            </button>
          );
        })}
      </div>

      {/* Award Category Filter Track */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="mr-1 flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Award className="size-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Award Track:</span>
          </div>
          <button
            type="button"
            onClick={() => onSelectCategory("ALL")}
            className={`rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategoryId === "ALL"
                ? "border border-indigo-600 bg-indigo-50 font-semibold text-indigo-700 shadow-xs dark:border-indigo-500/50 dark:bg-indigo-950/40 dark:text-indigo-300"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
                onClick={() => onSelectCategory(cat.id)}
                className={`rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "border border-indigo-600 bg-indigo-50 font-semibold text-indigo-700 shadow-xs dark:border-indigo-500/50 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
