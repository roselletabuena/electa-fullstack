"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Users, AlertCircle } from "lucide-react";
import type { ContestantDto, AwardCategoryDto, DynamicDivisionItem, DivisionDto } from "../types";
import { ContestantCard } from "./ContestantCard";
import { ContestantProfileModal } from "./ContestantProfileModal";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { FreeVoteCooldownBanner } from "@/features/voting/components/FreeVoteCooldownBanner";

interface ContestantRosterProps {
  initialContestants: ContestantDto[];
  divisions?: DynamicDivisionItem[] | DivisionDto[] | undefined;
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
    if (divisions && divisions.length > 1) {
      return divisions.map((d) => ({
        label: d.name,
        value: d.name,
      }));
    }
    if (divisions && divisions.length <= 1) {
      return undefined;
    }

    const distinctCustom = Array.from(
      new Set(
        initialContestants
          .map((c) => c.divisionRef?.name || c.divisionName)
          .filter((name): name is string => Boolean(name && name.trim())),
      ),
    );
    if (distinctCustom.length > 1) {
      return distinctCustom.map((div) => ({
        label: String(div).charAt(0).toUpperCase() + String(div).slice(1).toLowerCase(),
        value: String(div),
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
    if (formattedDivisions && formattedDivisions.length > 1 && selectedDivision !== "ALL") {
      const targetDiv = selectedDivision.toLowerCase();
      const matchExact =
        c.division.toLowerCase() === targetDiv ||
        (c.divisionName && c.divisionName.toLowerCase() === targetDiv) ||
        (c.divisionRef?.name && c.divisionRef.name.toLowerCase() === targetDiv) ||
        (c.divisionId &&
          (c.divisionId === selectedDivision || c.divisionId.toLowerCase() === targetDiv));

      const matchedConfigDivision = divisions?.find(
        (d) =>
          d.name.toLowerCase() === targetDiv ||
          (d.id && (d.id === selectedDivision || d.id.toLowerCase() === targetDiv)),
      );

      const matchConfigured = matchedConfigDivision
        ? (c.divisionId && c.divisionId === matchedConfigDivision.id) ||
          (c.divisionRef?.id && c.divisionRef.id === matchedConfigDivision.id) ||
          (c.divisionName &&
            c.divisionName.toLowerCase() === matchedConfigDivision.name.toLowerCase()) ||
          (c.divisionRef?.name &&
            c.divisionRef.name.toLowerCase() === matchedConfigDivision.name.toLowerCase()) ||
          c.division.toLowerCase() === matchedConfigDivision.name.toLowerCase()
        : false;

      const isFemaleFilter = targetDiv.includes("female");
      const isMaleFilter = !isFemaleFilter && targetDiv.includes("male");
      const matchNormalized =
        (c.division === "FEMALE" && isFemaleFilter) ||
        (c.division === "MALE" && isMaleFilter) ||
        (c.division === "LGBTQ" && targetDiv.includes("lgbt")) ||
        (c.division === "TEEN" && targetDiv.includes("teen"));

      if (!matchExact && !matchConfigured && !matchNormalized) {
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
      <div className="flex flex-col justify-between gap-4 border-b border-slate-300 pb-4 md:flex-row md:items-end dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-sky-700 uppercase dark:text-sky-400">
            <Users className="h-4 w-4" />
            <span>Official Candidates</span>
          </div>
          <h2 className="heading-font mt-1 text-2xl tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Meet the Candidates
          </h2>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400">
          Showing{" "}
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {filteredContestants.length}
          </span>{" "}
          of{" "}
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {initialContestants.length}
          </span>{" "}
          contestants
        </div>
      </div>

      {/* Free Daily Voting Quota & Live Cooldown Status Banner */}
      {initialContestants.length > 0 && initialContestants[0]?.eventId && (
        <div className="mt-6">
          <FreeVoteCooldownBanner
            eventId={initialContestants[0].eventId}
            onBoostClick={
              onVoteClick && initialContestants[0]
                ? () => {
                    const candidate = initialContestants[0];
                    if (candidate) {
                      onVoteClick(candidate);
                    }
                  }
                : undefined
            }
          />
        </div>
      )}

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
        <div className="mt-12 flex flex-col items-center justify-center rounded-none border border-slate-300 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
          <AlertCircle className="mb-3 h-10 w-10 text-amber-600 dark:text-amber-400/80" />
          <h3 className="heading-font text-lg text-slate-900 dark:text-slate-200">
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
            className="btn-primary mt-4 px-4 py-2 text-xs"
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
