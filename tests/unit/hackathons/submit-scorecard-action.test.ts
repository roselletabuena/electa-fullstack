import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitScorecardAction } from "@/features/hackathons/actions/submit-scorecard";
import { getSession } from "@/lib/auth/get-session";
import { submitJudgeEvaluation } from "@/features/hackathons/services/rubric-service";

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/features/hackathons/services/rubric-service", () => ({
  submitJudgeEvaluation: vi.fn(),
}));

describe("submitScorecardAction Server Action", () => {
  const validEventId = "11111111-1111-4111-a111-111111111111";
  const validCriterionId = "22222222-2222-4222-a222-222222222222";
  const validPayload = {
    eventId: validEventId,
    submissionId: "submission-prj-99",
    scores: [{ criterionId: validCriterionId, score: 8.5 }],
    notes: "Great pitch demo",
    isDraft: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return UNAUTHORIZED when session is missing", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const result = await submitScorecardAction(validPayload);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("UNAUTHORIZED");
    expect(result.error?.message).toMatch(/must be signed in/i);
  });

  it("should return FORBIDDEN when user has no judge role (Scenario 2 Non-Judge Rejection)", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "usr_regular_attendee",
      email: "voter@example.com",
      role: "VOTER",
      isJudge: false,
    });

    const result = await submitScorecardAction(validPayload);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("FORBIDDEN");
    expect(result.error?.message).toMatch(/Unauthorized: User does not have judge privileges/i);
  });

  it("should return VALIDATION_ERROR when input payload is malformed", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "usr_judge_01",
      email: "judge@example.com",
      role: "JUDGE",
      isJudge: true,
    });

    const invalidPayload = {
      eventId: "invalid-uuid",
      submissionId: "",
      scores: [],
    };

    const result = await submitScorecardAction(invalidPayload);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("should succeed and return scorecard data for authorized judge (Scenario 1 Happy Path)", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "usr_judge_01",
      email: "judge@example.com",
      role: "JUDGE",
      isJudge: true,
    });

    const mockScorecardResult = {
      evaluationId: "eval-999",
      eventId: validEventId,
      submissionId: "submission-prj-99",
      judgeId: "usr_judge_01",
      isDraft: false,
      compositeScore: 8.5,
      notes: "Great pitch demo",
      scores: [
        {
          criterionId: validCriterionId,
          score: 8.5,
          criterionTitle: "Tech Execution",
          weight: 100,
        },
      ],
      submittedAt: "2026-10-14T12:00:00.000Z",
    };

    vi.mocked(submitJudgeEvaluation).mockResolvedValue(mockScorecardResult);

    const result = await submitScorecardAction(validPayload);
    expect(result.success).toBe(true);
    expect(result.data?.compositeScore).toBe(8.5);
    expect(result.data?.judgeId).toBe("usr_judge_01");
    expect(submitJudgeEvaluation).toHaveBeenCalledWith({
      eventId: validEventId,
      submissionId: "submission-prj-99",
      judgeId: "usr_judge_01",
      scores: [{ criterionId: validCriterionId, score: 8.5 }],
      notes: "Great pitch demo",
      isDraft: false,
    });
  });

  it("should allow organizer sessions to submit scorecards", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "usr_organizer_01",
      email: "organizer@example.com",
      role: "ORGANIZER",
    });

    vi.mocked(submitJudgeEvaluation).mockResolvedValue({
      evaluationId: "eval-organizer-1",
      eventId: validEventId,
      submissionId: "submission-prj-99",
      judgeId: "usr_organizer_01",
      isDraft: true,
      compositeScore: 7.0,
      scores: [],
      submittedAt: "2026-10-14T12:00:00.000Z",
    });

    const result = await submitScorecardAction({
      ...validPayload,
      isDraft: true,
    });
    expect(result.success).toBe(true);
  });

  it("should catch and return INTERNAL_ERROR if domain service throws", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "usr_judge_01",
      email: "judge@example.com",
      role: "JUDGE",
    });

    vi.mocked(submitJudgeEvaluation).mockRejectedValue(
      new Error("Database connection timed out")
    );

    const result = await submitScorecardAction(validPayload);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INTERNAL_ERROR");
    expect(result.error?.message).toBe("Database connection timed out");
  });
});
