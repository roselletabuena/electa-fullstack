import React, { useState, useMemo } from "react";
import {
  Search,
  ExternalLink,
  Code2,
  Video,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JudgingProgressBar, type JudgingFilterMode } from "./judging-progress-bar";
import { RubricScorecardModal } from "./rubric-scorecard-modal";

export interface JudgePortalProjectItem {
  readonly id: string;
  readonly title: string;
  readonly tagline?: string | null | undefined;
  readonly description: string;
  readonly repositoryUrl: string;
  readonly demoUrl?: string | null | undefined;
  readonly videoUrl?: string | null | undefined;
  readonly status: "SUBMITTED" | "ACCEPTED" | "REJECTED" | "WINNER";
  readonly trackTags: readonly string[];
  readonly evaluationStatus: "PENDING" | "DRAFT" | "COMPLETED";
  readonly existingEvaluation?: {
    readonly compositeScore: number;
    readonly notes?: string | null | undefined;
    readonly isDraft: boolean;
    readonly scores: ReadonlyArray<{
      readonly criterionId: string;
      readonly score: number;
    }>;
  } | undefined;
}

export interface JudgePortalProps {
  readonly eventId: string;
  readonly eventSlug: string;
  readonly eventTitle: string;
  readonly criteria: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly description?: string | null | undefined;
    readonly weight: number;
    readonly maxScore: number;
    readonly displayOrder: number;
  }>;
  readonly projects: ReadonlyArray<JudgePortalProjectItem>;
  readonly currentJudgeId: string;
}

export function JudgePortal({
  eventId,
  eventSlug,
  eventTitle,
  criteria,
  projects: initialProjects,
  currentJudgeId,
}: Readonly<JudgePortalProps>): React.JSX.Element {
  const [projects, setProjects] =
    useState<ReadonlyArray<JudgePortalProjectItem>>(initialProjects);
  const [activeFilter, setActiveFilter] = useState<JudgingFilterMode>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProject, setSelectedProject] =
    useState<JudgePortalProjectItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute evaluated count based on active local state
  const evaluatedCount = useMemo(() => {
    return projects.filter((p) => p.evaluationStatus === "COMPLETED").length;
  }, [projects]);

  // Filter projects by active filter and search query
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Filter tab
      if (activeFilter === "PENDING" && project.evaluationStatus === "COMPLETED") {
        return false;
      }
      if (activeFilter === "COMPLETED" && project.evaluationStatus !== "COMPLETED") {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = project.title.toLowerCase().includes(query);
        const matchesTagline = project.tagline?.toLowerCase().includes(query);
        const matchesTrack = project.trackTags.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesTagline && !matchesTrack) {
          return false;
        }
      }

      return true;
    });
  }, [projects, activeFilter, searchQuery]);

  const handleEvaluationSubmitted = (result: {
    readonly submissionId: string;
    readonly compositeScore: number;
    readonly isDraft: boolean;
    readonly scores: Array<{ readonly criterionId: string; readonly score: number }>;
    readonly notes?: string | null | undefined;
  }) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== result.submissionId) return p;
        return {
          ...p,
          evaluationStatus: result.isDraft ? "DRAFT" : "COMPLETED",
          existingEvaluation: {
            compositeScore: result.compositeScore,
            isDraft: result.isDraft,
            scores: result.scores,
            notes: result.notes,
          },
        };
      })
    );

    if (!result.isDraft) {
      setSelectedProject(null);
    }

    const project = projects.find((p) => p.id === result.submissionId);
    setToastMessage(
      result.isDraft
        ? `Draft evaluation saved for "${project?.title || "project"}".`
        : `Final scorecard submitted for "${project?.title || "project"}" (Score: ${result.compositeScore.toFixed(2)}).`
    );

    // Auto-dismiss toast
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#070b13] dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-none border border-emerald-300 bg-white p-3.5 shadow-lg dark:border-emerald-700 dark:bg-slate-900"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 space-y-2 border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-none bg-slate-900 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-widest text-white dark:bg-slate-100 dark:text-slate-900">
              Judge Console
            </span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              Event ID: {eventId.slice(0, 8)}...
            </span>
          </div>

          <h1 className="font-heading text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {eventTitle}
          </h1>
          <p className="font-sans text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
            Review assigned hackathon demo pitches, assign multi-criteria weighted
            rubric scores, and submit evaluations before deliberation.
          </p>
        </div>

        {/* Progress Bar & Filter Header */}
        <div className="mb-6">
          <JudgingProgressBar
            totalCount={projects.length}
            evaluatedCount={evaluatedCount}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* Search and Quick Filter Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title or track..."
              className="w-full rounded-none border border-slate-300 bg-white py-2 pl-9 pr-8 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
            <Layers className="h-3.5 w-3.5" />
            <span>
              Showing {filteredProjects.length} of {projects.length} Projects
            </span>
          </div>
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-none border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Sparkles className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-slate-100">
              No matching projects found
            </h3>
            <p className="mt-1 font-sans text-xs text-slate-500 dark:text-slate-400">
              {searchQuery
                ? `No submissions matched "${searchQuery}". Try a different keyword.`
                : "No submissions available under this filter."}
            </p>
            {(searchQuery || activeFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("ALL");
                }}
                className="mt-4 rounded-none border border-slate-900 bg-slate-900 px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const isCompleted = project.evaluationStatus === "COMPLETED";
              const isDraft = project.evaluationStatus === "DRAFT";

              return (
                <div
                  key={project.id}
                  className={cn(
                    "flex flex-col justify-between rounded-none border bg-white p-5 shadow-xs transition-all hover:border-slate-400 hover:shadow-md dark:bg-slate-900",
                    isCompleted
                      ? "border-emerald-300/80 dark:border-emerald-900/60"
                      : isDraft
                        ? "border-amber-300/80 dark:border-amber-900/60"
                        : "border-slate-300 dark:border-slate-800"
                  )}
                >
                  <div className="space-y-3">
                    {/* Status Badge Row */}
                    <div className="flex items-center justify-between gap-2">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 rounded-none border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>
                            Evaluated (
                            {project.existingEvaluation?.compositeScore.toFixed(2)}
                            )
                          </span>
                        </span>
                      ) : isDraft ? (
                        <span className="inline-flex items-center gap-1 rounded-none border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          <Clock className="h-3 w-3" />
                          <span>Draft In Progress</span>
                        </span>
                      ) : (
                        <span className="rounded-none border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Pending Review
                        </span>
                      )}

                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {project.trackTags[0] || "General Track"}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <h3 className="font-heading text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                        {project.title}
                      </h3>
                      {project.tagline && (
                        <p className="mt-1 font-sans text-xs font-medium text-slate-600 dark:text-slate-400">
                          {project.tagline}
                        </p>
                      )}
                    </div>

                    <p className="line-clamp-2 font-sans text-xs text-slate-500 dark:text-slate-400">
                      {project.description}
                    </p>

                    {/* Track Tags */}
                    {project.trackTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {project.trackTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-none border border-slate-200 bg-slate-50 px-1.5 py-0.2 font-mono text-[10px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Project Links */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                      {project.repositoryUrl && (
                        <a
                          href={project.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-slate-600 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
                        >
                          <Code2 className="h-3.5 w-3.5" />
                          <span>Repo</span>
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Demo</span>
                        </a>
                      )}
                      {project.videoUrl && (
                        <a
                          href={project.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-slate-600 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Pitch</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Card Button */}
                  <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className={cn(
                        "w-full rounded-none px-4 py-2 font-mono text-xs font-black uppercase tracking-wider transition-all",
                        isCompleted
                          ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          : isDraft
                            ? "border border-amber-600 bg-amber-600 text-white hover:bg-amber-700 dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950"
                            : "border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                      )}
                    >
                      {isCompleted
                        ? "Review / Edit Scorecard"
                        : isDraft
                          ? "Resume Evaluation"
                          : "Evaluate Project"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {selectedProject && (
        <RubricScorecardModal
          isOpen={true}
          onClose={() => setSelectedProject(null)}
          eventId={eventId}
          project={selectedProject}
          criteria={criteria}
          existingEvaluation={selectedProject.existingEvaluation}
          onEvaluationSubmitted={handleEvaluationSubmitted}
        />
      )}
    </div>
  );
}
