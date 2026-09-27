"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Users, AlertCircle } from "lucide-react";
import type { ContestantDto, AwardCategoryDto } from "../types";
import { ContestantCard } from "./ContestantCard";
import { ContestantProfileModal } from "./ContestantProfileModal";
import { CategoryFilterBar } from "./CategoryFilterBar";

export interface DynamicDivisionItem {
  id?: string | undefined;
  name: string;
}

interface ContestantRosterProps {
  initialContestants: ContestantDto[];
  divisions?: DynamicDivisionItem[] | undefined;
  categories?: AwardCategoryDto[] | undefined;
  onVoteClick?: ((contestant: ContestantDto) => void) | undefined;
}

export const ContestantRoster: React.FC<ContestantRosterProps> = ({
  initialContestants,
  divisions,
  categories = [],
  onVoteClick,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const divisionFromUrl = searchParams.get("division") || "ALL";
  const categoryFromUrl = searchParams.get("category") || "ALL";

  const [selectedDivision, setSelectedDivision] = useState<string>(divisionFromUrl);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "ALL">(categoryFromUrl);
  const [activeContestant, setActiveContestant] = useState<ContestantDto | null>(null);

  const formattedDivisions = React.useMemo(() => {
    if (divisions && divisions.length > 0) {
      return divisions.map((d) => ({
        label: d.name,
        value: d.name,
      }));
    }
    const distinct = Array.from(new Set(initialContestants.map((c) => c.division).filter(Boolean)));
    if (distinct.length > 0) {
      return distinct.map((div) => ({
        label: div.charAt(0).toUpperCase() + div.slice(1).toLowerCase(),
        value: div,
      }));
    }
    return undefined;
  }, [divisions, initialContestants]);

  const updateUrlFilters = (division: string, categoryId: string | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    if (division && division !== "ALL") {
      params.set("division", division);
    } else {
      params.delete("division");
    }

    if (categoryId && categoryId !== "ALL") {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSelectDivision = (division: string) => {
    setSelectedDivision(division);
    updateUrlFilters(division, selectedCategoryId);
  };

  const handleSelectCategory = (categoryId: string | "ALL") => {
    setSelectedCategoryId(categoryId);
    updateUrlFilters(selectedDivision, categoryId);
  };

  // Client-side filtering for sub-50ms instant roster response
  const filteredContestants = initialContestants.filter((c) => {
    if (c.status !== "ACTIVE") return false;
    if (selectedDivision !== "ALL") {
      const matchExact = c.division.toLowerCase() === selectedDivision.toLowerCase();
      const isFemaleFilter = selectedDivision.toLowerCase().includes("female");
      const isMaleFilter = !isFemaleFilter && selectedDivision.toLowerCase().includes("male");
      const matchNormalized =
        (c.division === "FEMALE" && isFemaleFilter) ||
        (c.division === "MALE" && isMaleFilter) ||
        (c.division === "LGBTQ" && selectedDivision.toLowerCase().includes("lgbt")) ||
        (c.division === "TEEN" && selectedDivision.toLowerCase().includes("teen"));
      if (!matchExact && !matchNormalized) {
        return false;
      }
    }
    if (selectedCategoryId !== "ALL") {
      const isNominated = c.categories.some((cat) => cat.id === selectedCategoryId);
      if (!isNominated) return false;
    }
    return true;
  });

  return (
    <section className="w-full py-8">
      {/* Roster Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-amber-700 uppercase dark:text-amber-400">
            <Users className="h-4 w-4" />
            <span>Official Candidates</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Meet the Candidates
          </h2>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400">
          Showing{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {filteredContestants.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {initialContestants.length}
          </span>{" "}
          contestants
        </div>
      </div>

      {/* Division and Category Filter Bar */}
      <CategoryFilterBar
        divisions={formattedDivisions}
        selectedDivision={selectedDivision}
        onSelectDivision={handleSelectDivision}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
      />

      {/* Contestant 4:5 Card Grid */}
      {filteredContestants.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredContestants.map((contestant) => (
            <ContestantCard
              key={contestant.id}
              contestant={contestant}
              onSelect={setActiveContestant}
              onVoteClick={onVoteClick}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-white/10 dark:bg-slate-900/40">
          <AlertCircle className="mb-3 h-10 w-10 text-amber-600 dark:text-amber-400/80" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">
            No candidates found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-600 dark:text-slate-400">
            There are no active contestants matching the selected division and award filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedDivision("ALL");
              setSelectedCategoryId("ALL");
              updateUrlFilters("ALL", "ALL");
            }}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Candidate Dossier & Photo Lightbox Modal */}
      <ContestantProfileModal
        contestant={activeContestant}
        isOpen={Boolean(activeContestant)}
        onClose={() => setActiveContestant(null)}
        onVoteClick={onVoteClick}
      />
    </section>
  );
};
