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
}: TaxonomyPresetsCardProps): React.JSX.Element {
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
    <Card className="border-indigo-100/70 bg-linear-to-br from-indigo-50/40 via-white to-purple-50/20 shadow-xs dark:border-indigo-950/40 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/10">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Wand2 className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                1-Click Competition Taxonomy Presets
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Instantly populate standard competition divisions and award tracks with zero manual
                typing.
              </CardDescription>
            </div>
          </div>
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
                  "relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600",
                  isSelected
                    ? "border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-600 dark:border-indigo-500 dark:bg-slate-900 dark:ring-indigo-500"
                    : "border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-lg",
                      isSelected
                        ? "bg-indigo-600 text-white dark:bg-indigo-500"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-slate-50 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {preset.badge}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {preset.title}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {preset.description}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-white dark:bg-indigo-500">
                    <Check className="size-2.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Preset Details & Action Footer */}
        {currentPreset && (
          <div className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/80">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Included in &quot;{currentPreset.title}&quot;:
                </span>
                <Badge variant="muted" className="text-[10px]">
                  {currentPreset.divisions.length} Divisions
                </Badge>
                <Badge variant="muted" className="text-[10px]">
                  {currentPreset.awardCategories.length} Award Tracks
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Divisions: {currentPreset.divisions.map((d) => d.name).join(", ")}
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              disabled={isApplying || disabled}
              onClick={handleApply}
              className="shrink-0 gap-1.5 bg-indigo-600 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
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
