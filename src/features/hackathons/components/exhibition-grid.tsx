"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { Search, Sparkles, Filter, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "./project-card";
import { SubmissionForm } from "./submission-form";
import type { ProjectSubmissionDto } from "../types/submission";

export interface ExhibitionGridProps {
  readonly eventSlug: string;
  readonly eventTitle: string;
  readonly initialSubmissions: readonly ProjectSubmissionDto[];
  readonly availableTracks?: readonly string[] | undefined;
  readonly isSubmissionOpen?: boolean | undefined;
}

/**
 * Converts track title to kebab-case URL slug (e.g. "AI & Agents" -> "ai-agents")
 */
function trackToSlug(track: string): string {
  return track
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Interactive Exhibition Grid with nuqs URL state synchronization for track filtering,
 * live text search, and zero-radius brutalist aesthetics.
 */
export function ExhibitionGrid({
  eventSlug,
  eventTitle,
  initialSubmissions,
  availableTracks: propTracks,
  isSubmissionOpen = true,
}: Readonly<ExhibitionGridProps>): React.JSX.Element {
  const [submissions, setSubmissions] = useState<ProjectSubmissionDto[]>([
    ...initialSubmissions,
  ]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // nuqs URL query state for ?track=...
  const [urlTrack, setUrlTrack] = useQueryState(
    "track",
    parseAsString.withDefault("all").withOptions({ shallow: true })
  );

  // Derive unique tracks from submissions and props
  const allTracks = useMemo(() => {
    const trackSet = new Set<string>();
    if (propTracks) {
      for (const t of propTracks) trackSet.add(t);
    }
    for (const sub of submissions) {
      for (const t of sub.trackTags) trackSet.add(t.trackName);
    }
    return Array.from(trackSet);
  }, [propTracks, submissions]);

  // Filter projects by track and search query
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Track filter check
      if (urlTrack && urlTrack !== "all") {
        const matchesTrack = sub.trackTags.some(
          (t) =>
            t.trackName.toLowerCase() === urlTrack.toLowerCase() ||
            trackToSlug(t.trackName) === urlTrack.toLowerCase()
        );
        if (!matchesTrack) return false;
      }

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = sub.title.toLowerCase().includes(q);
        const matchesTagline = sub.tagline?.toLowerCase().includes(q);
        const matchesDesc = sub.description.toLowerCase().includes(q);
        const matchesMember = sub.members.some((m) => m.name.toLowerCase().includes(q));
        const matchesTrack = sub.trackTags.some((t) => t.trackName.toLowerCase().includes(q));

        if (!matchesTitle && !matchesTagline && !matchesDesc && !matchesMember && !matchesTrack) {
          return false;
        }
      }

      return true;
    });
  }, [submissions, urlTrack, searchQuery]);

  const handleTrackChange = (slugOrName: string) => {
    void setUrlTrack(slugOrName === "all" ? null : slugOrName);
  };

  const handleProjectSubmitted = (newSub: ProjectSubmissionDto) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  return (
    <section className="space-y-6">
      {/* Top Bar: Title, Search, and Action */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-sky-600 dark:text-sky-400" />
            <h2 className="font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Project Exhibition
            </h2>
          </div>
          <p className="mt-1 font-sans text-xs text-slate-600 dark:text-slate-300">
            Explore innovations submitted by teams in{" "}
            <strong className="text-slate-900 dark:text-white">{eventTitle}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-2.5 left-3 size-4 text-slate-400" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="h-9 pl-9 text-xs"
            />
          </div>

          {/* Submit Button */}
          {isSubmissionOpen && (
            <Button
              onClick={() => setIsSubmitModalOpen(true)}
              className="btn-primary shrink-0 gap-1.5 rounded-none px-4 py-2 text-xs font-extrabold uppercase tracking-wider"
            >
              <Plus className="size-4" />
              <span>Submit Project</span>
            </Button>
          )}
        </div>
      </div>

      {/* Track Filter Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2" role="region" aria-label="Track filters">
        <div className="flex items-center gap-1.5 pr-2 font-mono text-[11px] font-bold text-slate-600 uppercase dark:text-slate-400">
          <Filter className="size-3.5 text-slate-500" />
          <span>Track:</span>
        </div>

        {/* All Tracks Pill */}
        <button
          type="button"
          onClick={() => handleTrackChange("all")}
          className={`rounded-none px-3.5 py-1.5 font-mono text-xs font-extrabold uppercase transition ${
            !urlTrack || urlTrack === "all"
              ? "border border-slate-900 bg-slate-900 text-white shadow-xs dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
              : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          }`}
        >
          All Tracks
        </button>

        {/* Dynamic Track Pills */}
        {allTracks.map((track) => {
          const trackSlug = trackToSlug(track);
          const isSelected =
            urlTrack?.toLowerCase() === trackSlug.toLowerCase() ||
            urlTrack?.toLowerCase() === track.toLowerCase();

          return (
            <button
              type="button"
              key={track}
              onClick={() => handleTrackChange(trackSlug)}
              className={`rounded-none px-3.5 py-1.5 font-mono text-xs font-extrabold uppercase transition ${
                isSelected
                  ? "border border-sky-600 bg-sky-600 text-white shadow-xs dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950 font-black"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              {track}
            </button>
          );
        })}
      </div>

      {/* Active Filter Metric Bar */}
      <div className="flex items-center justify-between font-mono text-xs text-slate-600 dark:text-slate-400">
        <span>
          Showing{" "}
          <strong className="text-slate-900 dark:text-white">
            {filteredSubmissions.length}
          </strong>{" "}
          of {submissions.length} project{submissions.length === 1 ? "" : "s"}
        </span>

        {(urlTrack && urlTrack !== "all") || searchQuery ? (
          <button
            type="button"
            onClick={() => {
              void setUrlTrack(null);
              setSearchQuery("");
            }}
            className="inline-flex items-center gap-1 font-bold text-sky-600 hover:underline dark:text-sky-400"
          >
            <RotateCcw className="size-3" />
            <span>Reset Filters</span>
          </button>
        ) : null}
      </div>

      {/* Exhibition Grid Cards or Empty State */}
      {filteredSubmissions.length > 0 ? (
        <div
          data-testid="exhibition-project-grid"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredSubmissions.map((submission) => (
            <ProjectCard key={submission.id} submission={submission} />
          ))}
        </div>
      ) : (
        <div
          data-testid="exhibition-empty-state"
          className="border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#0d1424]"
        >
          <div className="mx-auto flex size-12 items-center justify-center border border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Filter className="size-6" />
          </div>
          <h3 className="mt-4 font-heading text-lg font-extrabold text-slate-900 dark:text-white">
            No projects found
          </h3>
          <p className="mt-2 font-sans text-xs text-slate-600 dark:text-slate-400">
            {urlTrack && urlTrack !== "all"
              ? `No submissions currently tagged with "${urlTrack}".`
              : "No project submissions have been published yet."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {(urlTrack && urlTrack !== "all") || searchQuery ? (
              <Button
                variant="outline"
                onClick={() => {
                  void setUrlTrack(null);
                  setSearchQuery("");
                }}
                className="rounded-none text-xs"
              >
                Clear Filters
              </Button>
            ) : null}
            {isSubmissionOpen && (
              <Button
                onClick={() => setIsSubmitModalOpen(true)}
                className="btn-primary rounded-none text-xs"
              >
                Submit the First Project
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Submission Dialog */}
      <SubmissionForm
        eventSlug={eventSlug}
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        availableTracks={allTracks}
        onSuccess={handleProjectSubmitted}
      />
    </section>
  );
}
