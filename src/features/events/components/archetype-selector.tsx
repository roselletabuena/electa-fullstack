"use client";

import React from "react";
import {
  Crown,
  Landmark,
  Code2,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import {
  EVENT_ARCHETYPES,
  EVENT_ARCHETYPE_CONFIGS,
  type EventArchetype,
} from "../types/archetype";
import { cn } from "@/lib/utils";

export interface ArchetypeSelectorProps {
  value: EventArchetype;
  onChange: (value: EventArchetype) => void;
  disabled?: boolean;
  className?: string;
}

const ARCHETYPE_ICONS: Record<EventArchetype, React.ElementType> = {
  PAGEANT: Crown,
  STUDENT_COUNCIL: Landmark,
  HACKATHON: Code2,
  CUSTOM: Sliders,
};

export function ArchetypeSelector({
  value,
  onChange,
  disabled = false,
  className,
}: Readonly<ArchetypeSelectorProps>): React.JSX.Element {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-1">
        <label
          id="archetype-selector-label"
          className="text-xs font-extrabold uppercase tracking-widest text-slate-900 dark:text-slate-100"
        >
          Event Archetype
        </label>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Choose the competition structure. This customizes ballot rules, terminology, and taxonomy fields.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="archetype-selector-label"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {EVENT_ARCHETYPES.map((archetypeKey) => {
          const config = EVENT_ARCHETYPE_CONFIGS[archetypeKey];
          const isSelected = value === archetypeKey;
          const IconComponent = ARCHETYPE_ICONS[archetypeKey];

          return (
            <button
              key={archetypeKey}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(archetypeKey)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(archetypeKey);
                }
              }}
              className={cn(
                "group relative flex min-h-40 cursor-pointer flex-col justify-between border p-4 text-left transition-all rounded-none",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-400",
                isSelected
                  ? "border-sky-600 bg-sky-50/70 shadow-xs dark:border-sky-500 dark:bg-sky-500/10"
                  : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-[#0d1424] dark:hover:border-slate-700 dark:hover:bg-slate-900/60",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center border rounded-none transition-colors",
                      isSelected
                        ? "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950"
                        : "border-slate-200 bg-slate-100 text-slate-700 group-hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    )}
                  >
                    <IconComponent className="size-4" />
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400">
                      <CheckCircle2 className="size-3.5" />
                      <span>Selected</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-heading text-sm font-black tracking-tight text-slate-900 dark:text-slate-100">
                    {config.label}
                  </h3>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {config.description}
                  </p>
                </div>
              </div>

              {/* Terminology pills */}
              <div className="mt-4 border-t border-slate-200/80 pt-3 dark:border-slate-800/80">
                <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                  <span className="border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {config.groupingTerm}
                  </span>
                  <span className="border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {config.candidateTerm}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
