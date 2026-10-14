import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RubricScorecardModal } from "@/features/hackathons/components/rubric-scorecard-modal";
import * as submitActionModule from "@/features/hackathons/actions/submit-scorecard";

vi.mock("@/features/hackathons/actions/submit-scorecard", () => ({
  submitScorecardAction: vi.fn(),
}));

const mockProject = {
  id: "sub-101",
  title: "NeuralFlow AI",
  tagline: "Autonomous Agent Workflow Engine",
  description: "Next-gen workflow automation platform powered by edge LLMs.",
  repositoryUrl: "https://github.com/neuralflow/core",
  demoUrl: "https://neuralflow.ai",
  trackTags: ["AI / ML", "Developer Tools"],
};

const mockCriteria = [
  {
    id: "crit-1",
    title: "Technical Complexity",
    description: "Architectural depth and code quality",
    weight: 30,
    maxScore: 10,
    displayOrder: 1,
  },
  {
    id: "crit-2",
    title: "Impact & Utility",
    description: "Real-world usefulness and market readiness",
    weight: 30,
    maxScore: 10,
    displayOrder: 2,
  },
  {
    id: "crit-3",
    title: "Innovation & Originality",
    description: "Novelty of approach and problem framing",
    weight: 20,
    maxScore: 10,
    displayOrder: 3,
  },
  {
    id: "crit-4",
    title: "Presentation & Demo",
    description: "Clarity of pitch and working demonstration",
    weight: 20,
    maxScore: 10,
    displayOrder: 4,
  },
];

describe("RubricScorecardModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    // mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders project details and criteria cards when open", () => {
    render(
      <RubricScorecardModal
        isOpen={true}
        onClose={vi.fn()}
        eventId="evt-42"
        project={mockProject}
        criteria={mockCriteria}
        onEvaluationSubmitted={vi.fn()}
      />
    );

    expect(screen.getByText("NeuralFlow AI")).toBeInTheDocument();
    expect(screen.getByText("Technical Complexity")).toBeInTheDocument();
    expect(screen.getByText("Impact & Utility")).toBeInTheDocument();
    expect(screen.getByText("Innovation & Originality")).toBeInTheDocument();
    expect(screen.getByText("Presentation & Demo")).toBeInTheDocument();
  });

  it("calculates live weighted composite score instantly upon score selection", () => {
    render(
      <RubricScorecardModal
        isOpen={true}
        onClose={vi.fn()}
        eventId="evt-42"
        project={mockProject}
        criteria={mockCriteria}
        onEvaluationSubmitted={vi.fn()}
      />
    );

    // Initial composite score is 0.00
    expect(screen.getByTestId("composite-score")).toHaveTextContent("0.00");

    // Click score 8 for Criterion 1 (Technical Complexity 30%)
    const crit1Score8 = screen.getByRole("radio", {
      name: /criterion technical complexity score 8/i,
    });
    fireEvent.click(crit1Score8);

    // Click score 9 for Criterion 2 (Impact 30%)
    const crit2Score9 = screen.getByRole("radio", {
      name: /criterion impact & utility score 9/i,
    });
    fireEvent.click(crit2Score9);

    // Click score 7 for Criterion 3 (Innovation 20%)
    const crit3Score7 = screen.getByRole("radio", {
      name: /criterion innovation & originality score 7/i,
    });
    fireEvent.click(crit3Score7);

    // Click score 10 for Criterion 4 (Presentation 20%)
    const crit4Score10 = screen.getByRole("radio", {
      name: /criterion presentation & demo score 10/i,
    });
    fireEvent.click(crit4Score10);

    // Composite = (8*0.3) + (9*0.3) + (7*0.2) + (10*0.2) = 2.4 + 2.7 + 1.4 + 2.0 = 8.50
    expect(screen.getByTestId("composite-score")).toHaveTextContent("8.50");
  });

  it("supports keyboard navigation (digits 1-9 and 0 for 10) on focused criterion rating controls", () => {
    render(
      <RubricScorecardModal
        isOpen={true}
        onClose={vi.fn()}
        eventId="evt-42"
        project={mockProject}
        criteria={mockCriteria}
        onEvaluationSubmitted={vi.fn()}
      />
    );

    const radiogroups = screen.getAllByRole("radiogroup");
    const radiogroup = radiogroups[0];
    expect(radiogroup).toBeDefined();
    if (!radiogroup) throw new Error("Radiogroup not found");
    radiogroup.focus();

    // Press '8'
    fireEvent.keyDown(radiogroup, { key: "8", code: "Digit8" });
    const score8Btn = screen.getByRole("radio", {
      name: /criterion technical complexity score 8/i,
    });
    expect(score8Btn).toHaveAttribute("aria-checked", "true");

    // Press '0' for 10
    fireEvent.keyDown(radiogroup, { key: "0", code: "Digit0" });
    const score10Btn = screen.getByRole("radio", {
      name: /criterion technical complexity score 10/i,
    });
    expect(score10Btn).toHaveAttribute("aria-checked", "true");
  });

  it("validates missing criterion on final submit and displays error highlight", async () => {
    render(
      <RubricScorecardModal
        isOpen={true}
        onClose={vi.fn()}
        eventId="evt-42"
        project={mockProject}
        criteria={mockCriteria}
        onEvaluationSubmitted={vi.fn()}
      />
    );

    // Only score Criterion 1
    const crit1Score8 = screen.getByRole("radio", {
      name: /criterion technical complexity score 8/i,
    });
    fireEvent.click(crit1Score8);

    // Click "Submit Final Evaluation"
    const submitBtn = screen.getByRole("button", {
      name: /submit final evaluation/i,
    });
    fireEvent.click(submitBtn);

    // Expect missing criteria error message to appear
    const errorMessages = await screen.findAllByText(
      /please assign a score between 1 and 10/i
    );
    expect(errorMessages.length).toBeGreaterThan(0);

    // Verify submitScorecardAction was NOT called for final submission
    expect(submitActionModule.submitScorecardAction).not.toHaveBeenCalled();
  });

  it("allows saving draft with partial scores and notes", async () => {
    vi.mocked(submitActionModule.submitScorecardAction).mockResolvedValueOnce({
      success: true,
      data: {
        evaluationId: "eval-draft-1",
        eventId: "evt-42",
        submissionId: "sub-101",
        judgeId: "judge-99",
        isDraft: true,
        compositeScore: 8.0,
        notes: "Great architecture, needs more benchmark tests.",
        scores: [{ criterionId: "crit-1", score: 8 }],
        submittedAt: new Date().toISOString(),
      },
      error: null,
    });

    const handleSubmitted = vi.fn();
    render(
      <RubricScorecardModal
        isOpen={true}
        onClose={vi.fn()}
        eventId="evt-42"
        project={mockProject}
        criteria={mockCriteria}
        onEvaluationSubmitted={handleSubmitted}
      />
    );

    const crit1Score8 = screen.getByRole("radio", {
      name: /criterion technical complexity score 8/i,
    });
    fireEvent.click(crit1Score8);

    const notesInput = screen.getByPlaceholderText(
      /private feedback or deliberation notes/i
    );
    fireEvent.change(notesInput, {
      target: { value: "Great architecture, needs more benchmark tests." },
    });

    const draftBtn = screen.getByRole("button", { name: /save draft/i });
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(submitActionModule.submitScorecardAction).toHaveBeenCalledWith({
        eventId: "evt-42",
        submissionId: "sub-101",
        isDraft: true,
        notes: "Great architecture, needs more benchmark tests.",
        scores: [{ criterionId: "crit-1", score: 8 }],
      });
      expect(handleSubmitted).toHaveBeenCalledWith(
        expect.objectContaining({
          isDraft: true,
          submissionId: "sub-101",
        })
      );
    });
  });

  it("submits final evaluation when all criteria are scored", async () => {
    vi.mocked(submitActionModule.submitScorecardAction).mockResolvedValueOnce({
      success: true,
      data: {
        evaluationId: "eval-final-1",
        eventId: "evt-42",
        submissionId: "sub-101",
        judgeId: "judge-99",
        isDraft: false,
        compositeScore: 8.5,
        notes: "Excellent overall.",
        scores: [
          { criterionId: "crit-1", score: 8 },
          { criterionId: "crit-2", score: 9 },
          { criterionId: "crit-3", score: 7 },
          { criterionId: "crit-4", score: 10 },
        ],
        submittedAt: new Date().toISOString(),
      },
      error: null,
    });

    const handleSubmitted = vi.fn();
    const handleClose = vi.fn();

    render(
      <RubricScorecardModal
        isOpen={true}
        onClose={handleClose}
        eventId="evt-42"
        project={mockProject}
        criteria={mockCriteria}
        onEvaluationSubmitted={handleSubmitted}
      />
    );

    // Score all 4
    fireEvent.click(
      screen.getByRole("radio", {
        name: /criterion technical complexity score 8/i,
      })
    );
    fireEvent.click(
      screen.getByRole("radio", {
        name: /criterion impact & utility score 9/i,
      })
    );
    fireEvent.click(
      screen.getByRole("radio", {
        name: /criterion innovation & originality score 7/i,
      })
    );
    fireEvent.click(
      screen.getByRole("radio", {
        name: /criterion presentation & demo score 10/i,
      })
    );

    const submitBtn = screen.getByRole("button", {
      name: /submit final evaluation/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitActionModule.submitScorecardAction).toHaveBeenCalledWith({
        eventId: "evt-42",
        submissionId: "sub-101",
        isDraft: false,
        notes: undefined,
        scores: [
          { criterionId: "crit-1", score: 8 },
          { criterionId: "crit-2", score: 9 },
          { criterionId: "crit-3", score: 7 },
          { criterionId: "crit-4", score: 10 },
        ],
      });
      expect(handleSubmitted).toHaveBeenCalledWith(
        expect.objectContaining({
          isDraft: false,
          submissionId: "sub-101",
          compositeScore: 8.5,
        })
      );
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("enforces strict zero-radius styling across modal and inputs", () => {
    const { container } = render(
      <RubricScorecardModal
        isOpen={true}
        onClose={vi.fn()}
        eventId="evt-42"
        project={mockProject}
        criteria={mockCriteria}
        onEvaluationSubmitted={vi.fn()}
      />
    );

    const roundedElements = container.querySelectorAll(
      "[class*='rounded-sm'], [class*='rounded-md'], [class*='rounded-lg'], [class*='rounded-xl'], [class*='rounded-full']"
    );
    expect(roundedElements.length).toBe(0);
  });
});
