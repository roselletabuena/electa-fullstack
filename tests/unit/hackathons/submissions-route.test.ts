import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/events/[slug]/submissions/route";

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/features/hackathons/services/submission-service", () => ({
  createProjectSubmission: vi.fn(),
  getProjectSubmissions: vi.fn(),
}));

import { getSession } from "@/lib/auth/get-session";
import {
  createProjectSubmission,
  getProjectSubmissions,
} from "@/features/hackathons/services/submission-service";

describe("submissions route handler", () => {
  const context = {
    params: Promise.resolve({ slug: "hackathon-2026" }),
  };

  const sampleSubmissionDto = {
    id: "sub-123",
    eventId: "evt-123",
    teamLeadId: "lead-1",
    title: "QuantumVote",
    tagline: null,
    description: "An AI voting platform for hackathons",
    repositoryUrl: "https://github.com/the-devsketeers/quantum-vote",
    demoUrl: null,
    videoUrl: null,
    status: "SUBMITTED" as const,
    createdAt: "2026-10-15T12:00:00.000Z",
    updatedAt: "2026-10-15T12:00:00.000Z",
    members: [],
    trackTags: [{ id: "t-1", submissionId: "sub-123", trackName: "AI", createdAt: "2026-10-15T12:00:00.000Z" }],
    links: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return submissions list successfully", async () => {
      vi.mocked(getProjectSubmissions).mockResolvedValueOnce({
        success: true,
        data: [sampleSubmissionDto],
      });

      const request = new NextRequest("http://localhost:3000/api/events/hackathon-2026/submissions?track=AI");
      const response = await GET(request, context);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].title).toBe("QuantumVote");
    });

    it("should return 404 when event is not found", async () => {
      vi.mocked(getProjectSubmissions).mockResolvedValueOnce({
        success: false,
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Event not found.",
          status: 404,
        },
      });

      const request = new NextRequest("http://localhost:3000/api/events/unknown/submissions");
      const response = await GET(request, { params: Promise.resolve({ slug: "unknown" }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Event not found.");
    });
  });

  describe("POST", () => {
    const validBody = {
      title: "QuantumVote",
      description: "An AI voting platform for hackathons",
      repositoryUrl: "https://github.com/the-devsketeers/quantum-vote",
      trackTags: ["AI"],
    };

    it("should reject when user is unauthenticated", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const request = new NextRequest("http://localhost:3000/api/events/hackathon-2026/submissions", {
        method: "POST",
        body: JSON.stringify(validBody),
      });

      const response = await POST(request, context);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain("Authentication required");
    });

    it("should reject when payload fails validation", async () => {
      vi.mocked(getSession).mockResolvedValueOnce({ userId: "lead-1", email: "lead@example.com" } as never);

      const request = new NextRequest("http://localhost:3000/api/events/hackathon-2026/submissions", {
        method: "POST",
        body: JSON.stringify({
          title: "Q",
          description: "short",
          repositoryUrl: "ftp://example.com",
          trackTags: [],
        }),
      });

      const response = await POST(request, context);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it("should return service error when service rejects creation", async () => {
      vi.mocked(getSession).mockResolvedValueOnce({ userId: "lead-1", email: "lead@example.com" } as never);
      vi.mocked(createProjectSubmission).mockResolvedValueOnce({
        success: false,
        error: {
          code: "SUBMISSION_WINDOW_CLOSED",
          message: "Submission window is closed.",
          status: 403,
        },
      });

      const request = new NextRequest("http://localhost:3000/api/events/hackathon-2026/submissions", {
        method: "POST",
        body: JSON.stringify(validBody),
      });

      const response = await POST(request, context);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Submission window is closed.");
    });

    it("should create submission and return 201 on success", async () => {
      vi.mocked(getSession).mockResolvedValueOnce({ userId: "lead-1", email: "lead@example.com" } as never);
      vi.mocked(createProjectSubmission).mockResolvedValueOnce({
        success: true,
        data: sampleSubmissionDto,
      });

      const request = new NextRequest("http://localhost:3000/api/events/hackathon-2026/submissions", {
        method: "POST",
        body: JSON.stringify(validBody),
      });

      const response = await POST(request, context);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe("sub-123");
      expect(json.data.title).toBe("QuantumVote");
    });
  });
});
