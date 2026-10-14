import * as React from "react";
import Link from "next/link";
import { Code2, ExternalLink, Video, Users, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProjectSubmissionDto } from "../types/submission";
import { PeoplesChoiceVoteButton } from "./peoples-choice-vote-button";

export interface ProjectCardProps {
  readonly submission: ProjectSubmissionDto;
  readonly className?: string;
  readonly isVotingOpen?: boolean;
  readonly initialHasVoted?: boolean;
  readonly onVoteSuccess?: ((totalVotes: number) => void);
}

function getStatusBadgeClasses(status: ProjectSubmissionDto["status"]): string {
  switch (status) {
    case "ACCEPTED":
      return "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    case "UNDER_REVIEW":
      return "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    case "REJECTED":
      return "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
}

/**
 * Renders a zero-radius brutalist project card showcasing hackathon deliverables,
 * track tags, team members, and external link chips.
 */
export function ProjectCard({
  submission,
  className,
  isVotingOpen = true,
  initialHasVoted,
  onVoteSuccess,
}: Readonly<ProjectCardProps>): React.JSX.Element {
  const {
    title,
    tagline,
    description,
    repositoryUrl,
    demoUrl,
    videoUrl,
    trackTags,
    members,
    links,
    status,
  } = submission;

  const isGitHub = repositoryUrl.toLowerCase().includes("github.com");

  return (
    <article
      data-testid={`project-card-${submission.id}`}
      className={`card-style flex flex-col justify-between border border-slate-300 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md dark:border-slate-800 dark:bg-[#0d1424] dark:hover:border-slate-700 ${
        className || ""
      }`}
    >
      <div>
        {/* Header: Track tags & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {trackTags.length > 0 ? (
              trackTags.map((tag) => (
                <Badge
                  key={tag.id || tag.trackName}
                  variant="accent"
                  className="rounded-none text-[10px] tracking-wider font-extrabold uppercase"
                >
                  {tag.trackName}
                </Badge>
              ))
            ) : (
              <Badge variant="muted" className="rounded-none text-[10px]">
                General Track
              </Badge>
            )}
          </div>

          <span
            className={`font-mono text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 border ${getStatusBadgeClasses(
              status
            )}`}
          >
            {status}
          </span>
        </div>

        {/* Title & Tagline */}
        <div className="mt-4">
          <h3 className="font-heading text-lg font-extrabold tracking-tight text-slate-900 line-clamp-1 dark:text-slate-50">
            {title}
          </h3>
          {tagline ? (
            <p className="mt-1 font-sans text-xs font-medium text-slate-600 line-clamp-2 dark:text-slate-300">
              {tagline}
            </p>
          ) : null}
        </div>

        {/* Description snippet */}
        <p className="mt-3 font-sans text-xs leading-relaxed text-slate-700 line-clamp-3 dark:text-slate-300">
          {description}
        </p>

        {/* Team Members Roster */}
        {members.length > 0 && (
          <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-600 dark:border-slate-800/80 dark:text-slate-400">
            <Users className="size-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="line-clamp-1">
              {members.map((m) => m.name).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Footer: External Link Action Chips & People's Choice Vote */}
      <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Repository Link Chip */}
            <Link
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source code repository for ${title}`}
              className="inline-flex items-center gap-1.5 border border-slate-900 bg-slate-900 px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider text-white uppercase shadow-xs transition hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <Code2 className="size-3.5" />
              <span>{isGitHub ? "GitHub" : "Repository"}</span>
            </Link>

            {/* Live Demo Link Chip */}
            {demoUrl ? (
              <Link
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open live demo for ${title}`}
                className="inline-flex items-center gap-1.5 border border-sky-600 bg-sky-600 px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider text-white uppercase shadow-xs transition hover:bg-sky-700 dark:border-sky-500 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-600"
              >
                <ExternalLink className="size-3.5" />
                <span>Live Demo</span>
              </Link>
            ) : null}

            {/* Video Pitch Link Chip */}
            {videoUrl ? (
              <Link
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Watch presentation video for ${title}`}
                className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider text-slate-700 uppercase transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Video className="size-3.5 text-rose-500" />
                <span>Video</span>
              </Link>
            ) : null}

            {/* Custom Links */}
            {links && links.length > 0
              ? links.slice(0, 2).map((l) => (
                  <Link
                    key={l.id || l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${l.label} for ${title}`}
                    className="inline-flex items-center gap-1.5 border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-wider text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <LinkIcon className="size-3 text-slate-400" />
                    <span className="line-clamp-1 max-w-[100px]">{l.label}</span>
                  </Link>
                ))
              : null}
          </div>

          <PeoplesChoiceVoteButton
            eventId={submission.eventId}
            submissionId={submission.id}
            projectTitle={title}
            initialVoteCount={submission.voteCount ?? 0}
            initialHasVoted={initialHasVoted}
            isVotingOpen={isVotingOpen}
            onVoteSuccess={onVoteSuccess}
            className="w-full justify-center sm:w-auto"
          />
        </div>
      </div>
    </article>
  );
}
