import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitProjectAction } from "@/features/hackathons/actions/submit-project";
import { getSession } from "@/lib/auth/get-session";
import { createProjectSubmission } from "@/features/hackathons/services/submission-service";
import type { ProjectSubmissionDto } from "@/features/hackathons/types/submission";

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/features/hackathons/services/submission-service", () => ({
  createProjectSubmission: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("submitProjectAction Server Action", () => {
  const eventSlug = "eth-manila-2026";
  const validPayload = {
    title: "Autonomous Voting Node",
    tagline: "Decentralized, zero-gas tally validator",
    description: "A high-performance offline-first voting engine with zero gas overhead and zk-proof verification.",
    repositoryUrl: "https://github.com/three-devsketeers/autonomous-voting-node",
    demoUrl: "https://demo.autonomousvoting.io",
    videoUrl: "https://youtube.com/watch?v=mockvideoid",
    trackTags: ["AI & Agents", "Web3"],
    members: [{ name: "Alice Dev", email: "alice@example.com", role: "Fullstack" }],
    links: [{ label: "Docs", url: "https://docs.autonomousvoting.io" }],
  };

  const mockSubmissionDto: ProjectSubmissionDto = {
    id: "sub-101",
    eventId: "evt-manila-1",
    teamLeadId: "usr_lead_01",
    title: validPayload.title,
    tagline: validPayload.tagline,
    description: validPayload.description,
    repositoryUrl: validPayload.repositoryUrl,
    demoUrl: validPayload.demoUrl,
    videoUrl: validPayload.videoUrl,
    status: "SUBMITTED",
    createdAt: "2026-10-14T12:00:00.000Z",
    updatedAt: "2026-10-14T12:00:00.000Z",
    members: [
      {
        id: "mem-1",
        submissionId: "sub-101",
        name: "Alice Dev",
        email: "alice@example.com",
        role: "Fullstack",
        createdAt: "2026-10-14T12:00:00.000Z",
      },
    ],
    trackTags: [
      {
        id: "trk-1",
        submissionId: "sub-101",
        trackName: "AI & Agents",
        createdAt: "2026-10-14T12:00:00.000Z",
      },
    ],
    links: [
      {
        id: "lnk-1",
        submissionId: "sub-101",
        label: "Docs",
        url: "https://docs.autonomousvoting.io",
        createdAt: "2026-10-14T12:00:00.000Z",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when user is unauthenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const result = await submitProjectAction(eventSlug, validPayload);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/must be signed in/i);
  });

  it("should return validation field errors when required fields are missing", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "usr_lead_01",
      email: "alice@example.com",
    });

    const invalidPayload = {
      title: "",
      description: "short",
      repositoryUrl: "not-a-url",
      trackTags: [],
    };

    const result = await submitProjectAction(eventSlug, invalidPayload);
    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.["title"]).toBeDefined();
    expect(result.fieldErrors?.["repositoryUrl"]).toBeDefined();
    expect(result.fieldErrors?.["trackTags"]).toBeDefined();
  });

  it("should succeed and return created submission DTO when payload is valid", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "usr_lead_01",
      email: "alice@example.com",
    });

    vi.mocked(createProjectSubmission).mockResolvedValue({
      success: true,
      data: mockSubmissionDto,
    });

    const result = await submitProjectAction(eventSlug, validPayload);
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe("sub-101");
    expect(result.data?.title).toBe("Autonomous Voting Node");
    expect(createProjectSubmission).toHaveBeenCalledWith(
      eventSlug,
      "usr_lead_01",
      expect.objectContaining({
        title: "Autonomous Voting Node",
        repositoryUrl: "https://github.com/three-devsketeers/autonomous-voting-node",
      })
    );
  });

  it("should handle domain service errors gracefully", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "usr_lead_01",
      email: "alice@example.com",
    });

    vi.mocked(createProjectSubmission).mockResolvedValue({
      success: false,
      error: {
        code: "SUBMISSION_WINDOW_CLOSED",
        message: "Submission window is closed.",
        status: 403,
      },
    });

    const result = await submitProjectAction(eventSlug, validPayload);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Submission window is closed.");
  });
});
