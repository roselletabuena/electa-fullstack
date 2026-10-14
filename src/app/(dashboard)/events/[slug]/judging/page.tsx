import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import {
  JudgePortal,
  type JudgePortalProjectItem,
} from "@/features/hackathons/components/judge-portal";
import { JudgeAuthGuard } from "@/features/hackathons/components/judge-auth-guard";

interface PageProps {
  readonly params: Promise<{
    readonly slug: string;
  }>;
}

/**
 * Validates whether the authenticated session has judge or organizer privileges.
 */
function isAuthorizedJudgeSession(session: {
  role?: string | undefined;
  isJudge?: boolean | undefined;
} | null): boolean {
  if (!session) return false;
  const normalizedRole = session.role?.toUpperCase();
  if (
    normalizedRole === "JUDGE" ||
    normalizedRole === "ORGANIZER" ||
    normalizedRole === "ADMIN"
  ) {
    return true;
  }
  return session.isJudge === true;
}

export async function generateMetadata(
  props: Readonly<PageProps>
): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await db.event.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });

  if (!event) {
    return {
      title: "Judge Portal Not Found | Electa",
      description: "The requested hackathon judging portal could not be found.",
    };
  }

  return {
    title: `Judge Portal: ${event.title} | Electa`,
    description: `Official Hackathon Judge Scoring Portal for ${event.title}. Multi-criteria weighted rubric evaluation console.`,
  };
}

export default async function JudgingPage(
  props: Readonly<PageProps>
): Promise<React.JSX.Element> {
  const { slug } = await props.params;

  const event = await db.event.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
    },
  });

  if (!event) {
    notFound();
  }

  const session = await getSession();

  if (!session?.userId) {
    return (
      <JudgeAuthGuard
        type="unauthenticated"
        eventSlug={slug}
        eventTitle={event.title}
      />
    );
  }

  if (!isAuthorizedJudgeSession(session)) {
    return (
      <JudgeAuthGuard
        type="forbidden"
        eventSlug={slug}
        eventTitle={event.title}
        userEmail={session.email || undefined}
      />
    );
  }

  // Fetch rubric criteria for the event
  const criteriaData = await db.rubricCriterion.findMany({
    where: { eventId: event.id },
    orderBy: { displayOrder: "asc" },
  });

  // Fetch project submissions for the event
  const submissionsData = await db.projectSubmission.findMany({
    where: {
      eventId: event.id,
      status: {
        in: ["SUBMITTED", "ACCEPTED", "WINNER"],
      },
    },
    include: {
      trackTags: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch existing evaluations by this judge for this event
  const evaluationsData = await db.judgeEvaluation.findMany({
    where: {
      eventId: event.id,
      judgeId: session.userId,
    },
    include: {
      scores: true,
    },
  });

  const evaluationMap = new Map(
    evaluationsData.map((ev) => [ev.submissionId, ev])
  );

  const criteria = criteriaData.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    weight: Number(c.weight),
    maxScore: c.maxScore,
    displayOrder: c.displayOrder,
  }));

  const projects: JudgePortalProjectItem[] = submissionsData.map((sub) => {
    const existingEv = evaluationMap.get(sub.id);

    let evaluationStatus: JudgePortalProjectItem["evaluationStatus"] = "PENDING";
    if (existingEv) {
      evaluationStatus = existingEv.isDraft ? "DRAFT" : "COMPLETED";
    }

    return {
      id: sub.id,
      title: sub.title,
      tagline: sub.tagline,
      description: sub.description,
      repositoryUrl: sub.repositoryUrl,
      demoUrl: sub.demoUrl,
      videoUrl: sub.videoUrl,
      status: sub.status as JudgePortalProjectItem["status"],
      trackTags: sub.trackTags.map((t) => t.trackName),
      evaluationStatus,
      existingEvaluation: existingEv
        ? {
            compositeScore: Number(existingEv.compositeScore ?? 0),
            notes: existingEv.notes,
            isDraft: existingEv.isDraft,
            scores: existingEv.scores.map((s) => ({
              criterionId: s.criterionId,
              score: Number(s.score),
            })),
          }
        : undefined,
    };
  });

  return (
    <JudgePortal
      eventId={event.id}
      eventSlug={event.slug}
      eventTitle={event.title}
      criteria={criteria}
      projects={projects}
      currentJudgeId={session.userId}
    />
  );
}
