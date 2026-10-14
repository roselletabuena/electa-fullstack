import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import JudgingPage, {
  generateMetadata,
} from "@/app/(dashboard)/events/[slug]/judging/page";
import { db } from "@/lib/db";
import { getSession, type UserSession } from "@/lib/auth/get-session";
import { notFound } from "next/navigation";
import { Prisma } from "@/generated/client/client";
import type {
  Event,
  RubricCriterion,
  ProjectSubmission,
  ProjectTrackTag,
} from "@/generated/client/client";
import type { JudgePortalProps } from "@/features/hackathons/components/judge-portal";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
    rubricCriterion: {
      findMany: vi.fn(),
    },
    projectSubmission: {
      findMany: vi.fn(),
    },
    judgeEvaluation: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

// Mock JudgePortal component to verify props with strict type
vi.mock("@/features/hackathons/components/judge-portal", () => ({
  JudgePortal: ({
    eventTitle,
    criteria,
    projects,
  }: Readonly<JudgePortalProps>) => (
    <div data-testid="mock-judge-portal">
      <span>Portal for {eventTitle}</span>
      <span>Criteria count: {criteria.length}</span>
      <span>Projects count: {projects.length}</span>
    </div>
  ),
}));

type ProjectWithTrackTags = ProjectSubmission & {
  trackTags: ProjectTrackTag[];
};

function createMockEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "evt-1",
    slug: "hack-2026",
    title: "Hack 2026",
    description: "Official Hackathon",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 86400000),
    publicationStatus: "PUBLISHED",
    draftPassphraseHash: null,
    showResultsOnClose: true,
    isFreeVotingEnabled: true,
    isFreeVotingOnly: false,
    dailyFreeVoteLimit: 1,
    takeRatePercentage: new Prisma.Decimal("12.00"),
    organizerId: "org-1",
    archetype: "HACKATHON",
    allowedEmailDomains: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockCriterion(
  overrides: Partial<RubricCriterion> = {},
): RubricCriterion {
  return {
    id: "c-1",
    eventId: "evt-1",
    title: "Code Quality",
    description: "Clean code",
    weight: new Prisma.Decimal("40.00"),
    maxScore: 10,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockProjectSubmission(
  overrides: Partial<ProjectWithTrackTags> = {},
): ProjectWithTrackTags {
  return {
    id: "sub-1",
    eventId: "evt-1",
    teamLeadId: "lead-1",
    title: "Smart Agent",
    tagline: "Autonomous Agent",
    description: "Agent project",
    repositoryUrl: "https://github.com/test",
    demoUrl: null,
    videoUrl: null,
    status: "SUBMITTED",
    voteCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    trackTags: [
      {
        id: "t-1",
        submissionId: "sub-1",
        trackName: "AI",
        createdAt: new Date(),
      },
    ],
    ...overrides,
  };
}

describe("JudgingPage Route Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateMetadata", () => {
    it("returns not found title when event does not exist", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(null);

      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "non-existent" }),
      });

      expect(metadata.title).toContain("Judge Portal Not Found");
    });

    it("returns formatted title when event exists", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(
        createMockEvent({
          id: "evt-1",
          title: "AI Hackathon 2026",
          description: "Official Hackathon",
        }),
      );

      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "ai-hackathon-2026" }),
      });

      expect(metadata.title).toBe("Judge Portal: AI Hackathon 2026 | Electa");
    });
  });

  describe("JudgingPage Rendering & Auth Guard", () => {
    it("triggers notFound() when event is not in database", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(null);

      try {
        await JudgingPage({
          params: Promise.resolve({ slug: "missing-slug" }),
        });
      } catch {
        // notFound() may throw in Next.js
      }

      expect(notFound).toHaveBeenCalled();
    });

    it("renders unauthenticated JudgeAuthGuard when user is not logged in", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(createMockEvent());
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const component = await JudgingPage({
        params: Promise.resolve({ slug: "hack-2026" }),
      });
      render(component);

      expect(screen.getByText(/judge sign-in required/i)).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /sign in as judge/i }),
      ).toBeInTheDocument();
    });

    it("renders forbidden JudgeAuthGuard when user does not have judge privileges", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(createMockEvent());

      const attendeeSession: UserSession = {
        userId: "user-attendee",
        email: "attendee@example.com",
        role: "ATTENDEE",
      };
      vi.mocked(getSession).mockResolvedValueOnce(attendeeSession);

      const component = await JudgingPage({
        params: Promise.resolve({ slug: "hack-2026" }),
      });
      render(component);

      expect(
        screen.getByText(/judge portal access restricted/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/attendee@example.com/i)).toBeInTheDocument();
    });

    it("renders JudgePortal when authenticated user has JUDGE role", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(createMockEvent());

      const judgeSession: UserSession = {
        userId: "judge-42",
        email: "judge@example.com",
        role: "JUDGE",
      };
      vi.mocked(getSession).mockResolvedValueOnce(judgeSession);

      vi.mocked(db.rubricCriterion.findMany).mockResolvedValueOnce([
        createMockCriterion({
          id: "c-1",
          title: "Code Quality",
          description: "Clean code",
          weight: new Prisma.Decimal("40.00"),
          maxScore: 10,
          displayOrder: 1,
        }),
      ]);

      vi.mocked(db.projectSubmission.findMany).mockResolvedValueOnce([
        createMockProjectSubmission({
          id: "sub-1",
          title: "Smart Agent",
          tagline: "Autonomous Agent",
          description: "Agent project",
        }),
      ]);

      vi.mocked(db.judgeEvaluation.findMany).mockResolvedValueOnce([]);

      const component = await JudgingPage({
        params: Promise.resolve({ slug: "hack-2026" }),
      });
      render(component);

      expect(screen.getByTestId("mock-judge-portal")).toBeInTheDocument();
      expect(screen.getByText("Portal for Hack 2026")).toBeInTheDocument();
      expect(screen.getByText("Criteria count: 1")).toBeInTheDocument();
      expect(screen.getByText("Projects count: 1")).toBeInTheDocument();
    });
  });
});
