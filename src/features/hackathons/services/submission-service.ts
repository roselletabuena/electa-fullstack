import { db } from "@/lib/db";
import { EventArchetype, EventPublicationStatus } from "@/generated/client/enums";
import { Prisma } from "@/generated/client/client";
import type { CreateProjectSubmissionInput } from "@/lib/validations/hackathon-submission";
import type {
  CreateSubmissionResult,
  GetSubmissionResult,
  GetSubmissionsResult,
  GetProjectSubmissionsFilter,
  ProjectSubmissionDto,
  ProjectMemberDto,
  ProjectTrackTagDto,
  ProjectSubmissionLinkDto,
} from "../types/submission";

/**
 * Serializes a Prisma ProjectSubmission entity with relations into a typed DTO
 */
function serializeSubmission(sub: {
  id: string;
  eventId: string;
  teamLeadId: string;
  title: string;
  tagline: string | null;
  description: string;
  repositoryUrl: string;
  demoUrl: string | null;
  videoUrl: string | null;
  status: ProjectSubmissionDto["status"];
  voteCount?: number | undefined;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    id: string;
    submissionId: string;
    name: string;
    email: string;
    role: string | null;
    createdAt: Date;
  }>;
  trackTags: Array<{
    id: string;
    submissionId: string;
    trackName: string;
    createdAt: Date;
  }>;
  links: Array<{
    id: string;
    submissionId: string;
    label: string;
    url: string;
    createdAt: Date;
  }>;
}): ProjectSubmissionDto {
  return {
    id: sub.id,
    eventId: sub.eventId,
    teamLeadId: sub.teamLeadId,
    title: sub.title,
    tagline: sub.tagline,
    description: sub.description,
    repositoryUrl: sub.repositoryUrl,
    demoUrl: sub.demoUrl,
    videoUrl: sub.videoUrl,
    status: sub.status,
    voteCount: sub.voteCount ?? 0,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
    members: sub.members.map(
      (m): ProjectMemberDto => ({
        id: m.id,
        submissionId: m.submissionId,
        name: m.name,
        email: m.email,
        role: m.role,
        createdAt: m.createdAt.toISOString(),
      })
    ),
    trackTags: sub.trackTags.map(
      (t): ProjectTrackTagDto => ({
        id: t.id,
        submissionId: t.submissionId,
        trackName: t.trackName,
        createdAt: t.createdAt.toISOString(),
      })
    ),
    links: sub.links.map(
      (l): ProjectSubmissionLinkDto => ({
        id: l.id,
        submissionId: l.submissionId,
        label: l.label,
        url: l.url,
        createdAt: l.createdAt.toISOString(),
      })
    ),
  };
}

/**
 * Creates a project entry for an open Hackathon event
 */
export async function createProjectSubmission(
  eventIdOrSlug: string,
  teamLeadId: string,
  input: CreateProjectSubmissionInput,
  options?: { now?: Date }
): Promise<CreateSubmissionResult> {
  const event = await db.event.findFirst({
    where: {
      OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }],
    },
    select: {
      id: true,
      archetype: true,
      publicationStatus: true,
      startsAt: true,
      endsAt: true,
    },
  });

  if (!event) {
    return {
      success: false,
      error: {
        code: "EVENT_NOT_FOUND",
        message: "Event not found.",
        status: 404,
      },
    };
  }

  if (event.archetype !== EventArchetype.HACKATHON) {
    return {
      success: false,
      error: {
        code: "NOT_A_HACKATHON",
        message: "Project submissions are only enabled for Hackathon events.",
        status: 400,
      },
    };
  }

  if (event.publicationStatus !== EventPublicationStatus.PUBLISHED) {
    return {
      success: false,
      error: {
        code: "EVENT_NOT_PUBLISHED",
        message: "Submissions are only allowed on published events.",
        status: 400,
      },
    };
  }

  const now = options?.now ?? new Date();

  if (now < event.startsAt) {
    return {
      success: false,
      error: {
        code: "SUBMISSION_WINDOW_CLOSED",
        message: "Submission window has not opened yet.",
        status: 403,
      },
    };
  }

  if (now > event.endsAt) {
    return {
      success: false,
      error: {
        code: "SUBMISSION_WINDOW_CLOSED",
        message: "Submission window is closed.",
        status: 403,
      },
    };
  }

  try {
    const created = await db.projectSubmission.create({
      data: {
        eventId: event.id,
        teamLeadId,
        title: input.title,
        tagline: input.tagline || null,
        description: input.description,
        repositoryUrl: input.repositoryUrl,
        demoUrl: input.demoUrl || null,
        videoUrl: input.videoUrl || null,
        status: "SUBMITTED",
        members: {
          create: input.members.map((m) => ({
            name: m.name,
            email: m.email,
            role: m.role || "Contributor",
          })),
        },
        trackTags: {
          create: input.trackTags.map((trackName) => ({
            trackName,
          })),
        },
        links: {
          create: input.links.map((l) => ({
            label: l.label,
            url: l.url,
          })),
        },
      },
      include: {
        members: true,
        trackTags: true,
        links: true,
      },
    });

    return {
      success: true,
      data: serializeSubmission(created),
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        error: {
          code: "DUPLICATE_SUBMISSION",
          message: "A submission with this title already exists for your team.",
          status: 409,
        },
      };
    }

    throw error;
  }
}

/**
 * Lists submissions for an event with optional filtering
 */
export async function getProjectSubmissions(
  eventIdOrSlug: string,
  filter?: GetProjectSubmissionsFilter
): Promise<GetSubmissionsResult> {
  const event = await db.event.findFirst({
    where: {
      OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }],
    },
    select: {
      id: true,
    },
  });

  if (!event) {
    return {
      success: false,
      error: {
        code: "EVENT_NOT_FOUND",
        message: "Event not found.",
        status: 404,
      },
    };
  }

  const whereClause: Prisma.ProjectSubmissionWhereInput = {
    eventId: event.id,
    ...(filter?.status ? { status: filter.status } : {}),
    ...(filter?.teamLeadId ? { teamLeadId: filter.teamLeadId } : {}),
    ...(filter?.track
      ? {
          trackTags: {
            some: {
              trackName: {
                equals: filter.track,
                mode: "insensitive",
              },
            },
          },
        }
      : {}),
  };

  const submissions = await db.projectSubmission.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      members: true,
      trackTags: true,
      links: true,
    },
  });

  return {
    success: true,
    data: submissions.map(serializeSubmission),
  };
}

/**
 * Retrieves a single project submission by ID
 */
export async function getProjectSubmissionById(
  submissionId: string
): Promise<GetSubmissionResult> {
  const submission = await db.projectSubmission.findUnique({
    where: { id: submissionId },
    include: {
      members: true,
      trackTags: true,
      links: true,
    },
  });

  if (!submission) {
    return {
      success: false,
      error: {
        code: "EVENT_NOT_FOUND",
        message: "Project submission not found.",
        status: 404,
      },
    };
  }

  return {
    success: true,
    data: serializeSubmission(submission),
  };
}
