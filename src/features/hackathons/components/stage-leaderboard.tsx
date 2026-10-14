"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Trophy,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Users,
  Code2,
  ExternalLink,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StageLeaderboardDataDto } from "../types/peoples-choice";

export interface StageLeaderboardProps {
  readonly initialData: StageLeaderboardDataDto;
  readonly pollIntervalMs?: number | undefined;
  readonly className?: string | undefined;
}

function getRankBadgeStyles(rank: number): {
  badgeBg: string;
  borderColor: string;
  textColor: string;
  fillColor: string;
} {
  switch (rank) {
    case 1:
      return {
        badgeBg: "bg-amber-400 text-slate-950 font-black",
        borderColor: "border-amber-400 dark:border-amber-500",
        textColor: "text-amber-500 dark:text-amber-400",
        fillColor: "bg-amber-400 dark:bg-amber-500",
      };
    case 2:
      return {
        badgeBg: "bg-slate-300 text-slate-900 font-black dark:bg-slate-600 dark:text-slate-100",
        borderColor: "border-slate-300 dark:border-slate-700",
        textColor: "text-slate-600 dark:text-slate-300",
        fillColor: "bg-slate-400 dark:bg-slate-500",
      };
    case 3:
      return {
        badgeBg: "bg-amber-700 text-amber-50 font-black dark:bg-amber-800 dark:text-amber-100",
        borderColor: "border-amber-700 dark:border-amber-800",
        textColor: "text-amber-700 dark:text-amber-500",
        fillColor: "bg-amber-700 dark:bg-amber-600",
      };
    default:
      return {
        badgeBg: "bg-slate-100 text-slate-700 font-extrabold dark:bg-slate-800 dark:text-slate-300",
        borderColor: "border-slate-200 dark:border-slate-800",
        textColor: "text-slate-700 dark:text-slate-400",
        fillColor: "bg-sky-600 dark:bg-sky-500",
      };
  }
}

/**
 * Stage Leaderboard component engineered for 16:9 / 4K auditorium projectors and live streams.
 * Features live polling, full keyboard fullscreen controls, zero-radius brutalist aesthetics,
 * and high-contrast dual-theme typography.
 */
export function StageLeaderboard({
  initialData,
  pollIntervalMs = 4000,
  className = "",
}: Readonly<StageLeaderboardProps>): React.JSX.Element {
  const [data, setData] = useState<StageLeaderboardDataDto>(initialData);
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Poll updated standings
  const fetchLatestStandings = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const url = `/api/events/${initialData.eventSlug}/stage-leaderboard${
        selectedTrack !== "all" ? `?track=${encodeURIComponent(selectedTrack)}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch (err: unknown) {
      console.warn("[StageLeaderboard] Failed to poll standings:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [initialData.eventSlug, selectedTrack]);

  // Set up polling interval
  useEffect(() => {
    if (pollIntervalMs <= 0) return;

    const timer = setInterval(() => {
      void fetchLatestStandings();
    }, pollIntervalMs);

    return () => clearInterval(timer);
  }, [pollIntervalMs, fetchLatestStandings]);

  const toggleFullscreen = useCallback(async (): Promise<void> => {
    try {
      await (!document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen());
    } catch (err: unknown) {
      console.warn("[StageLeaderboard] Fullscreen request rejected:", err);
    }
  }, []);

  // Track Fullscreen state & Hotkey listener ('F')
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          void toggleFullscreen();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFullscreen]);

  // Filter projects by track locally if needed or rely on fetched data
  const displayedProjects = useMemo(() => {
    if (selectedTrack === "all") {
      return data.topProjects;
    }
    return data.topProjects.filter((p) =>
      p.trackTags.some(
        (t) => t.toLowerCase() === selectedTrack.toLowerCase()
      )
    );
  }, [data.topProjects, selectedTrack]);

  const top3 = displayedProjects.slice(0, 3);
  const remainingProjects = displayedProjects.slice(3);

  return (
    <section
      data-testid="stage-leaderboard-container"
      className={`min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8 lg:p-12 dark:bg-[#080d19] dark:text-slate-100 ${className}`}
    >
      {/* Top Presentation Header Bar */}
      <header className="border-b border-slate-300 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 border border-emerald-500 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="size-2 animate-pulse bg-emerald-500" />
                LIVE STAGE
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                People&apos;s Choice Standings
              </span>
            </div>

            <h1 className="mt-2 font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
              {data.eventTitle}
            </h1>
          </div>

          {/* Quick Metrics & Operator Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="border border-slate-300 bg-slate-50 px-5 py-2.5 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Total Crowd Votes
              </span>
              <span className="font-mono text-2xl font-black text-slate-900 sm:text-3xl dark:text-white">
                {data.totalVotesCast.toLocaleString()}
              </span>
            </div>

            <div className="border border-slate-300 bg-slate-50 px-5 py-2.5 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Projects Showcase
              </span>
              <span className="font-mono text-2xl font-black text-slate-900 sm:text-3xl dark:text-white">
                {data.totalProjects}
              </span>
            </div>

            {/* Operator Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchLatestStandings()}
                disabled={isRefreshing}
                aria-label="Refresh leaderboard"
                className="inline-flex size-11 items-center justify-center border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <RotateCcw
                  className={`size-4 ${isRefreshing ? "animate-spin text-sky-600" : ""}`}
                />
              </button>

              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                className="btn-primary inline-flex h-11 items-center gap-2 px-4 font-mono text-xs font-black uppercase tracking-wider"
              >
                {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                <span className="hidden sm:inline">
                  {isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Track Filter Navigation Pills */}
        {data.tracks.length > 0 && (
          <div
            className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-4 dark:border-slate-800"
            role="region"
            aria-label="Track filters"
          >
            <div className="flex items-center gap-1.5 pr-2 font-mono text-xs font-bold text-slate-600 uppercase dark:text-slate-400">
              <Filter className="size-3.5 text-slate-500" />
              <span>Track:</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTrack("all")}
              className={`rounded-none px-4 py-1.5 font-mono text-xs font-extrabold uppercase transition ${
                selectedTrack === "all"
                  ? "border border-slate-900 bg-slate-900 text-white shadow-xs dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              All Tracks
            </button>

            {data.tracks.map((track) => {
              const isSelected = selectedTrack.toLowerCase() === track.toLowerCase();
              return (
                <button
                  type="button"
                  key={track}
                  onClick={() => setSelectedTrack(track)}
                  className={`rounded-none px-4 py-1.5 font-mono text-xs font-extrabold uppercase transition ${
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
        )}
      </header>

      {/* Main Standings Presentation Section */}
      <main className="mt-8 space-y-8">
        {/* Top 3 Podium Highlights Grid */}
        {top3.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              <h2 className="font-heading text-xl font-extrabold tracking-tight uppercase sm:text-2xl">
                Podium Frontrunners
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {top3.map((project) => {
                const style = getRankBadgeStyles(project.rank);
                return (
                  <article
                    key={project.id}
                    data-testid={`stage-rank-card-${project.id}`}
                    className={`card-style relative flex flex-col justify-between border-2 bg-white p-6 shadow-md transition-all duration-300 dark:bg-[#0d1424] ${style.borderColor}`}
                  >
                    <div>
                      {/* Rank Numeral Badge & Votes */}
                      <div className="flex items-start justify-between">
                        <span
                          className={`inline-block px-3 py-1 font-mono text-base tracking-widest uppercase ${style.badgeBg}`}
                        >
                          #{project.rank}
                        </span>

                        <div className="text-right">
                          <span className="block font-mono text-2xl font-black text-slate-900 sm:text-3xl dark:text-white">
                            {project.voteCount.toLocaleString()}
                          </span>
                          <span className="font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            {project.votePercentage}% of votes
                          </span>
                        </div>
                      </div>

                      {/* Vote Share Visual Bar */}
                      <div className="mt-4 h-2 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full transition-all duration-500 ${style.fillColor}`}
                          style={{ width: `${Math.min(100, Math.max(2, project.votePercentage))}%` }}
                        />
                      </div>

                      {/* Title & Tagline */}
                      <div className="mt-5">
                        <h3 className="font-heading text-xl font-black tracking-tight text-slate-900 line-clamp-1 dark:text-white">
                          {project.title}
                        </h3>
                        {project.tagline ? (
                          <p className="mt-1 font-sans text-xs font-medium text-slate-600 line-clamp-2 dark:text-slate-300">
                            {project.tagline}
                          </p>
                        ) : null}
                      </div>

                      {/* Track Tags */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.trackTags.map((t) => (
                          <Badge
                            key={t}
                            variant="accent"
                            className="rounded-none text-[10px] font-extrabold uppercase tracking-wider"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>

                      {/* Team Roster */}
                      {project.members.length > 0 && (
                        <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800/80 dark:text-slate-400">
                          <Users className="size-3.5 shrink-0 text-slate-400" />
                          <span className="line-clamp-1 font-medium">
                            {project.members.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Links Footer */}
                    <div className="mt-6 flex items-center gap-2 border-t border-slate-200/80 pt-4 dark:border-slate-800">
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 border border-slate-300 bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-slate-700 uppercase hover:bg-slate-50 dark:border-slate-700 dark:bg-white/5 dark:text-slate-300"
                      >
                        <Code2 className="size-3" />
                        <span>Source</span>
                      </a>
                      {project.demoUrl ? (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 border border-sky-600 bg-sky-600 px-2.5 py-1 font-mono text-[11px] font-bold text-white uppercase hover:bg-sky-700 dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950"
                        >
                          <ExternalLink className="size-3" />
                          <span>Demo</span>
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Extended Leaderboard Standings Table */}
        {remainingProjects.length > 0 && (
          <div className="border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <h3 className="font-heading text-lg font-black tracking-tight uppercase text-slate-900 dark:text-white">
                Contending Submissions (Ranks 4+)
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {remainingProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center dark:hover:bg-slate-900/40"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center border border-slate-300 bg-slate-100 font-mono text-sm font-black text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      #{project.rank}
                    </span>

                    <div>
                      <h4 className="font-heading text-base font-extrabold text-slate-900 line-clamp-1 dark:text-white">
                        {project.title}
                      </h4>
                      {project.tagline ? (
                        <p className="font-sans text-xs text-slate-500 line-clamp-1 dark:text-slate-400">
                          {project.tagline}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-wrap gap-1">
                      {project.trackTags.map((t) => (
                        <span
                          key={t}
                          className="border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-lg font-black text-slate-900 dark:text-white">
                        {project.voteCount.toLocaleString()}
                      </span>
                      <span className="block font-mono text-[10px] text-slate-500 uppercase">
                        {project.votePercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {displayedProjects.length === 0 && (
          <div className="border border-dashed border-slate-300 bg-white p-16 text-center dark:border-slate-800 dark:bg-[#0d1424]">
            <div className="mx-auto flex size-12 items-center justify-center border border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800">
              <Sparkles className="size-6 text-sky-600" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-extrabold text-slate-900 dark:text-white">
              No Votes Recorded Yet
            </h3>
            <p className="mt-2 font-sans text-xs text-slate-600 dark:text-slate-400">
              Attendees can cast People&apos;s Choice votes on project showcase cards.
            </p>
          </div>
        )}
      </main>
    </section>
  );
}
