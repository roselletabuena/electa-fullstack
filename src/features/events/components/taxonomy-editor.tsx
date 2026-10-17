"use client";

import React, { useState } from "react";
import { Plus, Trash2, Sparkles, Award, AlertCircle } from "lucide-react";
import { EVENT_ARCHETYPE_CONFIGS, type EventArchetype } from "../types/archetype";
import type {
  WizardPositionDraftInput,
  WizardDivisionDraftInput,
  WizardAwardDraftInput,
} from "@/lib/validations/archetype-wizard";
import { cn } from "@/lib/utils";

export interface TaxonomyEditorProps {
  archetype: EventArchetype;
  positions: WizardPositionDraftInput[];
  onPositionsChange: (positions: WizardPositionDraftInput[]) => void;
  divisions: WizardDivisionDraftInput[];
  onDivisionsChange: (divisions: WizardDivisionDraftInput[]) => void;
  awardCategories: WizardAwardDraftInput[];
  onAwardCategoriesChange: (awards: WizardAwardDraftInput[]) => void;
  className?: string;
  disabled?: boolean;
}

const PRESET_STUDENT_COUNCIL_POSITIONS: WizardPositionDraftInput[] = [
  {
    name: "President",
    description: "Executive leader",
    maxSelectionsPerVoter: 1,
    minSelectionsPerVoter: 0,
    displayOrder: 1,
  },
  {
    name: "Vice President",
    description: "Executive vice leader",
    maxSelectionsPerVoter: 1,
    minSelectionsPerVoter: 0,
    displayOrder: 2,
  },
  {
    name: "Secretary",
    description: "Records & communications",
    maxSelectionsPerVoter: 1,
    minSelectionsPerVoter: 0,
    displayOrder: 3,
  },
  {
    name: "Treasurer",
    description: "Finance and budgeting",
    maxSelectionsPerVoter: 1,
    minSelectionsPerVoter: 0,
    displayOrder: 4,
  },
  {
    name: "Councilors",
    description: "Legislative representatives (multi-seat)",
    maxSelectionsPerVoter: 5,
    minSelectionsPerVoter: 1,
    displayOrder: 5,
  },
];

const PRESET_HACKATHON_TRACKS: WizardPositionDraftInput[] = [
  {
    name: "Track A - Web & Cloud",
    description: "Full-stack apps, cloud infrastructure, developer tooling",
    maxSelectionsPerVoter: 1,
    minSelectionsPerVoter: 0,
    displayOrder: 1,
  },
  {
    name: "Track B - AI & Intelligent Agents",
    description: "Machine learning, LLMs, autonomous workflows",
    maxSelectionsPerVoter: 1,
    minSelectionsPerVoter: 0,
    displayOrder: 2,
  },
  {
    name: "Track C - Social & Climate Impact",
    description: "Civic tech, sustainability, public goods",
    maxSelectionsPerVoter: 1,
    minSelectionsPerVoter: 0,
    displayOrder: 3,
  },
];

const PRESET_PAGEANT_DIVISIONS: WizardDivisionDraftInput[] = [
  { name: "Female Category", description: "Female bracket", displayOrder: 1 },
  { name: "Male Category", description: "Male bracket", displayOrder: 2 },
  { name: "Teen Category", description: "Youth / Teen division", displayOrder: 3 },
  { name: "LGBTQ+ Category", description: "All-inclusive bracket", displayOrder: 4 },
];

const PRESET_PAGEANT_AWARDS: WizardAwardDraftInput[] = [
  {
    name: "People's Choice Award",
    description: "Public popular vote",
    isVotingOpen: true,
    displayOrder: 1,
  },
  {
    name: "Miss Photogenic",
    description: "Media and audience choice",
    isVotingOpen: true,
    displayOrder: 2,
  },
  {
    name: "Best in Formal Wear",
    description: "Judged gala segment",
    isVotingOpen: false,
    displayOrder: 3,
  },
];

function getItemPlaceholder(archetype: EventArchetype): string {
  switch (archetype) {
    case "STUDENT_COUNCIL":
      return "e.g. President, Senator, Representative";
    case "HACKATHON":
      return "e.g. Track A - Web3, AI & Agents";
    default:
      return "e.g. Female Division, Solo Vocalist";
  }
}

export function TaxonomyEditor({
  archetype,
  positions,
  onPositionsChange,
  divisions,
  onDivisionsChange,
  awardCategories,
  onAwardCategoriesChange,
  className,
  disabled = false,
}: Readonly<TaxonomyEditorProps>): React.JSX.Element {
  const config = EVENT_ARCHETYPE_CONFIGS[archetype];
  const isPositionBased =
    archetype === "STUDENT_COUNCIL" || archetype === "HACKATHON" || archetype === "CUSTOM";
  const isPageant = archetype === "PAGEANT";

  // Local form state for new item entry
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [maxSelections, setMaxSelections] = useState(1);
  const [minSelections, setMinSelections] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = itemName.trim();
    if (!trimmedName) {
      setFormError(`${config.groupingTerm} name cannot be empty.`);
      return;
    }

    if (isPositionBased) {
      if (positions.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
        setFormError(
          `A ${config.groupingTerm.toLowerCase()} named "${trimmedName}" already exists.`,
        );
        return;
      }

      if (minSelections > maxSelections) {
        setFormError("Minimum selections cannot exceed maximum selections.");
        return;
      }

      const newPos: WizardPositionDraftInput = {
        name: trimmedName,
        description: itemDescription.trim() || undefined,
        maxSelectionsPerVoter: maxSelections,
        minSelectionsPerVoter: minSelections,
        displayOrder: positions.length + 1,
      };

      onPositionsChange([...positions, newPos]);
    } else {
      // Pageant division
      if (divisions.some((d) => d.name.toLowerCase() === trimmedName.toLowerCase())) {
        setFormError(`A division named "${trimmedName}" already exists.`);
        return;
      }

      const newDiv: WizardDivisionDraftInput = {
        name: trimmedName,
        description: itemDescription.trim() || undefined,
        displayOrder: divisions.length + 1,
      };

      onDivisionsChange([...divisions, newDiv]);
    }

    // Reset inputs
    setItemName("");
    setItemDescription("");
    setMaxSelections(1);
    setMinSelections(0);
  };

  const handleRemovePosition = (index: number) => {
    onPositionsChange(positions.filter((_, i) => i !== index));
  };

  const handleRemoveDivision = (index: number) => {
    onDivisionsChange(divisions.filter((_, i) => i !== index));
  };

  const handleRemoveAward = (index: number) => {
    onAwardCategoriesChange(awardCategories.filter((_, i) => i !== index));
  };

  const handleLoadPresets = () => {
    setFormError(null);
    if (archetype === "STUDENT_COUNCIL") {
      onPositionsChange(PRESET_STUDENT_COUNCIL_POSITIONS);
    } else if (archetype === "HACKATHON") {
      onPositionsChange(PRESET_HACKATHON_TRACKS);
    } else if (archetype === "PAGEANT") {
      onDivisionsChange(PRESET_PAGEANT_DIVISIONS);
      onAwardCategoriesChange(PRESET_PAGEANT_AWARDS);
    } else {
      onPositionsChange([
        {
          name: "General Category A",
          maxSelectionsPerVoter: 1,
          minSelectionsPerVoter: 0,
          displayOrder: 1,
        },
        {
          name: "General Category B",
          maxSelectionsPerVoter: 1,
          minSelectionsPerVoter: 0,
          displayOrder: 2,
        },
      ]);
    }
  };

  const renderConfiguredItems = () => {
    if (isPositionBased) {
      if (positions.length === 0) {
        return (
          <div className="rounded-none border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No {config.groupingTerm.toLowerCase()}s configured yet. Click &quot;Load Presets&quot;
            or add one above.
          </div>
        );
      }

      return (
        <div className="space-y-2">
          {positions.map((pos, idx) => (
            <div
              key={`${pos.name}-${idx}`}
              className="flex items-center justify-between rounded-none border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-[#0d1424]"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                <div>
                  <div className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100">
                    {pos.name}
                  </div>
                  {pos.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pos.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-none border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
                  {pos.maxSelectionsPerVoter > 1
                    ? `Up to ${pos.maxSelectionsPerVoter} Seats`
                    : "Single Seat (1)"}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemovePosition(idx)}
                  disabled={disabled}
                  aria-label={`Remove ${pos.name}`}
                  className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-slate-400 transition hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (divisions.length === 0) {
      return (
        <div className="rounded-none border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          No divisions configured yet. Click &quot;Load Presets&quot; or add one above.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {divisions.map((div, idx) => (
          <div
            key={`${div.name}-${idx}`}
            className="flex items-center justify-between rounded-none border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-[#0d1424]"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
              <div>
                <div className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100">
                  {div.name}
                </div>
                {div.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {div.description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRemoveDivision(idx)}
              disabled={disabled}
              aria-label={`Remove ${div.name}`}
              className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-slate-400 transition hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header and Preset Loader */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <h3 className="font-heading text-sm font-black tracking-tight text-slate-900 dark:text-slate-100">
            {config.groupingTerm} Configuration
          </h3>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            {isPositionBased
              ? `Configure the ${config.groupingTerm.toLowerCase()}s voters will cast ballots for and define maximum seat limits.`
              : "Organize competition divisions and bracket categories for contestants."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadPresets}
          disabled={disabled}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-none border border-sky-600 bg-sky-50 px-3 py-1.5 text-xs font-bold tracking-wider text-sky-800 uppercase transition-colors hover:bg-sky-100 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20"
        >
          <Sparkles className="size-3.5 text-sky-600 dark:text-sky-400" />
          <span>Load Presets</span>
        </button>
      </div>

      {/* Add Item Section */}
      <div className="space-y-4 rounded-none border border-slate-300 bg-white p-4 dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="text-xs font-extrabold tracking-widest text-slate-900 uppercase dark:text-slate-100">
          Add New {config.groupingTerm}
        </div>

        {formError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-none border border-red-300 bg-red-50 p-2.5 text-xs font-semibold text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="taxonomy-item-name"
              className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
            >
              {config.groupingTerm} Name <span className="text-red-500">*</span>
            </label>
            <input
              id="taxonomy-item-name"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddItem(e);
                }
              }}
              placeholder={getItemPlaceholder(archetype)}
              disabled={disabled}
              className="mt-1 block w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="taxonomy-item-desc"
              className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
            >
              Description (Optional)
            </label>
            <input
              id="taxonomy-item-desc"
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddItem(e);
                }
              }}
              placeholder="Brief description or requirements"
              disabled={disabled}
              className="mt-1 block w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {isPositionBased && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="taxonomy-max-selections"
                className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              >
                Max Seats / Selections per Voter
              </label>
              <input
                id="taxonomy-max-selections"
                type="number"
                min={1}
                max={50}
                value={maxSelections}
                onChange={(e) => setMaxSelections(Number.parseInt(e.target.value, 10) || 1)}
                disabled={disabled}
                className="mt-1 block w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                For single-winner offices enter 1. For multi-seat bodies (e.g. 5 senators) enter 5.
              </span>
            </div>

            <div>
              <label
                htmlFor="taxonomy-min-selections"
                className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              >
                Min Selections (Optional)
              </label>
              <input
                id="taxonomy-min-selections"
                type="number"
                min={0}
                max={50}
                value={minSelections}
                onChange={(e) => setMinSelections(Number.parseInt(e.target.value, 10) || 0)}
                disabled={disabled}
                className="mt-1 block w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                Minimum choices required before ballot submission (default 0).
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleAddItem}
          disabled={disabled}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-none border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-black tracking-wider text-white uppercase transition hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <Plus className="size-3.5" />
          <span>Add {config.groupingTerm}</span>
        </button>
      </div>

      {/* Render Current List of Items */}
      <div className="space-y-3">
        <div className="text-xs font-extrabold tracking-widest text-slate-900 uppercase dark:text-slate-100">
          Configured {config.groupingTerm}s ({isPositionBased ? positions.length : divisions.length}
          )
        </div>

        {renderConfiguredItems()}
      </div>

      {/* For Pageants: Show Award Categories */}
      {isPageant && awardCategories.length > 0 && (
        <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="text-xs font-extrabold tracking-widest text-slate-900 uppercase dark:text-slate-100">
            Award Categories ({awardCategories.length})
          </div>
          <div className="space-y-2">
            {awardCategories.map((award, idx) => (
              <div
                key={`${award.name}-${idx}`}
                className="flex items-center justify-between rounded-none border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-[#0d1424]"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="size-4 text-amber-500" />
                  <div>
                    <span className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100">
                      {award.name}
                    </span>
                    {award.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {award.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "rounded-none px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                      award.isVotingOpen
                        ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
                    )}
                  >
                    {award.isVotingOpen ? "Voting Open" : "Judged Only"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAward(idx)}
                    disabled={disabled}
                    aria-label={`Remove ${award.name}`}
                    className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-slate-400 transition hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
