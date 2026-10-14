import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import JudgingPage, {
  generateMetadata,
} from "@/app/(dashboard)/events/[slug]/judging/page";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import { notFound } from "next/navigation";

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

// Mock JudgePortal component to verify props
vi.mock("@/features/hackathons/components/judge-portal", () => ({
  JudgePortal: ({
    eventTitle,
    criteria,
    projects,
  }: {
    eventTitle: string;
    criteria: Array<{ id: string }>;
    projects: Array<{ id: string; title: string }>;
  }) => (
    <div data-testid="mock-judge-portal">
      <span>Portal for {eventTitle}</span>
      <span>Criteria count: {criteria.length}</span>
      <span>Projects count: {projects.length}</span>
    </div>
  ),
}));

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
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: "evt-1",
        title: "AI Hackathon 2026",
        description: "Official Hackathon",
      } as unknown as Awaited<ReturnType<typeof db.event.findUnique>>);

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
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: "evt-1",
        slug: "hack-2026",
        title: "Hack 2026",
        description: "Test",
      } as unknown as Awaited<ReturnType<typeof db.event.findUnique>>);
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const component = await JudgingPage({
        params: Promise.resolve({ slug: "hack-2026" }),
      });
      render(component);

      expect(screen.getByText(/judge sign-in required/i)).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /sign in as judge/i })
      ).toBeInTheDocument();
    });

    it("renders forbidden JudgeAuthGuard when user does not have judge privileges", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: "evt-1",
        slug: "hack-2026",
        title: "Hack 2026",
        description: "Test",
      } as unknown as Awaited<ReturnType<typeof db.event.findUnique>>);
      vi.mocked(getSession).mockResolvedValueOnce({
        userId: "user-attendee",
        email: "attendee@example.com",
        role: "ATTENDEE",
        isJudge: false,
      } as unknown as Awaited<ReturnType<typeof getSession>>);

      const component = await JudgingPage({
        params: Promise.resolve({ slug: "hack-2026" }),
      });
      render(component);

      expect(
        screen.getByText(/judge portal access restricted/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/attendee@example.com/i)).toBeInTheDocument();
    });

    it("renders JudgePortal when authenticated user has JUDGE role", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: "evt-1",
        slug: "hack-2026",
        title: "Hack 2026",
        description: "Test",
      } as unknown as Awaited<ReturnType<typeof db.event.findUnique>>);
      vi.mocked(getSession).mockResolvedValueOnce({
        userId: "judge-42",
        email: "judge@example.com",
        role: "JUDGE",
      } as unknown as Awaited<ReturnType<typeof getSession>>);

      vi.mocked(db.rubricCriterion.findMany).mockResolvedValueOnce([
        {
          id: "c-1",
          eventId: "evt-1",
          title: "Code Quality",
          description: "Clean code",
          weight: 40 as unknown,
          maxScore: 10,
          displayOrder: 1,
        },
      ] as unknown as Awaited<ReturnType<typeof db.rubricCriterion.findMany>>);

      vi.mocked(db.projectSubmission.findMany).mockResolvedValueOnce([
        {
          id: "sub-1",
          eventId: "evt-1",
          title: "Smart Agent",
          tagline: "Autonomous Agent",
          description: "Agent project",
          repositoryUrl: "https://github.com/test",
          demoUrl: null,
          videoUrl: null,
          status: "SUBMITTED",
          trackTags: [{ id: "t-1", trackName: "AI" }],
        },
      ] as unknown as Awaited<ReturnType<typeof db.projectSubmission.findMany>>);

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
