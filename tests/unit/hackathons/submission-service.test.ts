import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventArchetype, EventPublicationStatus } from "@/generated/client/enums";
import { Prisma } from "@/generated/client/client";
import {
  createProjectSubmission,
  getProjectSubmissions,
  getProjectSubmissionById,
} from "@/features/hackathons/services/submission-service";
import type { CreateProjectSubmissionInput } from "@/lib/validations/hackathon-submission";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findFirst: vi.fn(),
    },
    projectSubmission: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";

describe("submission-service", () => {
  const mockNow = new Date("2026-10-15T12:00:00Z");

  const validEvent = {
    id: "evt-123",
    slug: "hackathon-2026",
    archetype: EventArchetype.HACKATHON,
    publicationStatus: EventPublicationStatus.PUBLISHED,
    startsAt: new Date("2026-10-14T00:00:00Z"),
    endsAt: new Date("2026-10-16T23:59:59Z"),
  };

  const sampleInput: CreateProjectSubmissionInput = {
    title: "QuantumVote AI",
    tagline: "AI voter verification",
    description: "Detailed description of quantum vote hackathon project.",
    repositoryUrl: "https://github.com/the-devsketeers/quantum-vote",
    demoUrl: "https://quantum-vote.vercel.app",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    trackTags: ["AI", "Security"],
    members: [
      { name: "Alice", email: "alice@example.com", role: "Team Lead" },
    ],
    links: [
      { label: "Docs", url: "https://docs.example.com" },
    ],
  };

  const mockCreatedDbRecord = {
    id: "sub-999",
    eventId: "evt-123",
    teamLeadId: "user-456",
    title: "QuantumVote AI",
    tagline: "AI voter verification",
    description: "Detailed description of quantum vote hackathon project.",
    repositoryUrl: "https://github.com/the-devsketeers/quantum-vote",
    demoUrl: "https://quantum-vote.vercel.app",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    status: "SUBMITTED" as const,
    createdAt: new Date("2026-10-15T12:01:00Z"),
    updatedAt: new Date("2026-10-15T12:01:00Z"),
    members: [
      {
        id: "mem-1",
        submissionId: "sub-999",
        name: "Alice",
        email: "alice@example.com",
        role: "Team Lead",
        createdAt: new Date("2026-10-15T12:01:00Z"),
      },
    ],
    trackTags: [
      {
        id: "track-1",
        submissionId: "sub-999",
        trackName: "AI",
        createdAt: new Date("2026-10-15T12:01:00Z"),
      },
      {
        id: "track-2",
        submissionId: "sub-999",
        trackName: "Security",
        createdAt: new Date("2026-10-15T12:01:00Z"),
      },
    ],
    links: [
      {
        id: "link-1",
        submissionId: "sub-999",
        label: "Docs",
        url: "https://docs.example.com",
        createdAt: new Date("2026-10-15T12:01:00Z"),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProjectSubmission", () => {
    it("should reject when event does not exist", () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce(null);

      return expect(
        createProjectSubmission("non-existent-event", "user-456", sampleInput, { now: mockNow })
      ).resolves.toEqual({
        success: false,
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Event not found.",
          status: 404,
        },
      });
    });

    it("should reject when event archetype is not HACKATHON", () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce({
        ...validEvent,
        archetype: EventArchetype.PAGEANT,
      } as never);

      return expect(
        createProjectSubmission("hackathon-2026", "user-456", sampleInput, { now: mockNow })
      ).resolves.toEqual({
        success: false,
        error: {
          code: "NOT_A_HACKATHON",
          message: "Project submissions are only enabled for Hackathon events.",
          status: 400,
        },
      });
    });

    it("should reject when event is in DRAFT status", () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce({
        ...validEvent,
        publicationStatus: EventPublicationStatus.DRAFT,
      } as never);

      return expect(
        createProjectSubmission("hackathon-2026", "user-456", sampleInput, { now: mockNow })
      ).resolves.toEqual({
        success: false,
        error: {
          code: "EVENT_NOT_PUBLISHED",
          message: "Submissions are only allowed on published events.",
          status: 400,
        },
      });
    });

    it("should reject when submission window has not started yet", () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce(validEvent as never);

      return expect(
        createProjectSubmission("hackathon-2026", "user-456", sampleInput, {
          now: new Date("2026-10-13T00:00:00Z"),
        })
      ).resolves.toEqual({
        success: false,
        error: {
          code: "SUBMISSION_WINDOW_CLOSED",
          message: "Submission window has not opened yet.",
          status: 403,
        },
      });
    });

    it("should reject when submission window has elapsed (post-deadline)", () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce(validEvent as never);

      return expect(
        createProjectSubmission("hackathon-2026", "user-456", sampleInput, {
          now: new Date("2026-10-17T00:00:00Z"),
        })
      ).resolves.toEqual({
        success: false,
        error: {
          code: "SUBMISSION_WINDOW_CLOSED",
          message: "Submission window is closed.",
          status: 403,
        },
      });
    });

    it("should create project submission successfully during open window", async () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce(validEvent as never);
      vi.mocked(db.projectSubmission.create).mockResolvedValueOnce(mockCreatedDbRecord as never);

      const result = await createProjectSubmission("hackathon-2026", "user-456", sampleInput, {
        now: mockNow,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("sub-999");
        expect(result.data.title).toBe("QuantumVote AI");
        expect(result.data.trackTags).toHaveLength(2);
        expect(result.data.members).toHaveLength(1);
        expect(result.data.links).toHaveLength(1);
      }
    });

    it("should handle duplicate submission conflict gracefully", () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce(validEvent as never);
      const prismaError = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.9.1",
      });
      vi.mocked(db.projectSubmission.create).mockRejectedValueOnce(prismaError);

      return expect(
        createProjectSubmission("hackathon-2026", "user-456", sampleInput, { now: mockNow })
      ).resolves.toEqual({
        success: false,
        error: {
          code: "DUPLICATE_SUBMISSION",
          message: "A submission with this title already exists for your team.",
          status: 409,
        },
      });
    });
  });

  describe("getProjectSubmissions", () => {
    it("should return submissions for an event", async () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce({ id: "evt-123" } as never);
      vi.mocked(db.projectSubmission.findMany).mockResolvedValueOnce([mockCreatedDbRecord] as never);

      const result = await getProjectSubmissions("hackathon-2026");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]?.title).toBe("QuantumVote AI");
      }
    });

    it("should return 404 when querying an unknown event", () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce(null);

      return expect(getProjectSubmissions("unknown")).resolves.toEqual({
        success: false,
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Event not found.",
          status: 404,
        },
      });
    });
  });

  describe("getProjectSubmissionById", () => {
    it("should return a submission by ID", async () => {
      vi.mocked(db.projectSubmission.findUnique).mockResolvedValueOnce(mockCreatedDbRecord);

      const result = await getProjectSubmissionById("sub-999");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("sub-999");
      }
    });

    it("should return 404 when submission does not exist", () => {
      vi.mocked(db.projectSubmission.findUnique).mockResolvedValueOnce(null);

      return expect(getProjectSubmissionById("sub-missing")).resolves.toEqual({
        success: false,
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Project submission not found.",
          status: 404,
        },
      });
    });
  });
});
