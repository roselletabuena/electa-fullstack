"use client";

import React, { useState } from "react";
import { Crown, Music, Sparkles, Trophy, Check, Loader2, Wand2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TAXONOMY_PRESETS, type TaxonomyPreset } from "../../constants/taxonomy-presets";
import { cn } from "@/lib/utils";

export interface TaxonomyPresetsCardProps {
  onApplyPreset: (preset: TaxonomyPreset) => Promise<void>;
  isApplying: boolean;
  disabled?: boolean;
}

const PRESET_ICONS = {
  crown: Crown,
  music: Music,
  sparkles: Sparkles,
  trophy: Trophy,
} as const;

export function TaxonomyPresetsCard({
  onApplyPreset,
  isApplying,
  disabled = false,
}: Readonly<TaxonomyPresetsCardProps>): React.JSX.Element {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("beauty-pageant");
  const [applyingPresetId, setApplyingPresetId] = useState<string | null>(null);

  const currentPreset =
    TAXONOMY_PRESETS.find((p) => p.id === selectedPresetId) ?? TAXONOMY_PRESETS[0];

  const handleApply = async () => {
    if (!currentPreset || isApplying || disabled) return;
    setApplyingPresetId(currentPreset.id);
    try {
      await onApplyPreset(currentPreset);
    } finally {
      setApplyingPresetId(null);
    }
  };

  return (
    <Card className="rounded-none border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div>
          <CardTitle className="font-heading text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            1-Click Competition Taxonomy Presets
          </CardTitle>
          <CardDescription className="font-sans text-xs text-slate-500 dark:text-slate-400">
            Instantly populate standard competition divisions and award categories with zero manual
            typing.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preset Selector Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {TAXONOMY_PRESETS.map((preset) => {
            const Icon = PRESET_ICONS[preset.iconName];
            const isSelected = selectedPresetId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                disabled={isApplying || disabled}
                onClick={() => setSelectedPresetId(preset.id)}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-none border p-3.5 text-left transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500",
                  isSelected
                    ? "border-sky-600 bg-sky-50/60 shadow-xs ring-1 ring-sky-600 dark:border-sky-500 dark:bg-slate-900 dark:ring-sky-500"
                    : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-none",
                      isSelected
                        ? "bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-none border-slate-300 bg-slate-50 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {preset.badge}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100">
                    {preset.title}
                  </h4>
                  <p className="mt-1 line-clamp-2 font-sans text-[11px] text-slate-500 dark:text-slate-400">
                    {preset.description}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-none bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950">
                    <Check className="size-2.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Preset Details & Action Footer */}
        {currentPreset && (
          <div className="flex flex-col gap-3 rounded-none border border-slate-200 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/60">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100">
                  Included in &quot;{currentPreset.title}&quot;:
                </span>
                <Badge
                  variant="outline"
                  className="rounded-none border-slate-300 bg-white font-mono text-[10px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {currentPreset.divisions.length} Divisions
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-none border-slate-300 bg-white font-mono text-[10px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {currentPreset.awardCategories.length} Award Categor
                  {currentPreset.awardCategories.length !== 1 ? "ies" : "y"}
                </Badge>
              </div>
              <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400">
                Divisions: {currentPreset.divisions.map((d) => d.name).join(", ")}
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              disabled={isApplying || disabled}
              onClick={handleApply}
              className="font-heading shrink-0 gap-1.5 rounded-none bg-slate-900 px-4 py-2 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {applyingPresetId === currentPreset.id || isApplying ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Applying Preset...
                </>
              ) : (
                <>
                  <Wand2 className="size-3.5" />
                  Apply &quot;{currentPreset.title}&quot; Preset
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
