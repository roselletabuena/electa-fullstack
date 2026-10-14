import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { JudgePortal } from "@/features/hackathons/components/judge-portal";

// Mock child modal to simplify isolated testing
vi.mock("@/features/hackathons/components/rubric-scorecard-modal", () => ({
  RubricScorecardModal: ({
    isOpen,
    project,
    onClose,
    onEvaluationSubmitted,
  }: {
    isOpen: boolean;
    project: { id: string; title: string };
    onClose: () => void;
    onEvaluationSubmitted: (res: {
      submissionId: string;
      compositeScore: number;
      isDraft: boolean;
      scores: Array<{ criterionId: string; score: number }>;
      notes?: string;
    }) => void;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-scorecard-modal">
        <span>Modal for {project.title}</span>
        <button
          onClick={() =>
            onEvaluationSubmitted({
              submissionId: project.id,
              compositeScore: 9.2,
              isDraft: false,
              scores: [{ criterionId: "c-1", score: 9 }],
              notes: "Great job!",
            })
          }
        >
          Mock Submit Final
        </button>
        <button onClick={onClose}>Mock Close</button>
      </div>
    );
  },
}));

const mockCriteria = [
  {
    id: "c-1",
    title: "Technical Excellence",
    description: "Code architecture and technical difficulty",
    weight: 50,
    maxScore: 10,
    displayOrder: 1,
  },
  {
    id: "c-2",
    title: "Design & UX",
    description: "User experience and polished aesthetics",
    weight: 50,
    maxScore: 10,
    displayOrder: 2,
  },
];

const mockProjects = [
  {
    id: "p-1",
    title: "AI Canvas Studio",
    tagline: "Collaborative generative design studio",
    description: "Real-time canvas for generative art and multi-modal models.",
    repositoryUrl: "https://github.com/example/ai-canvas",
    demoUrl: "https://aicanvas.example.com",
    videoUrl: null,
    status: "SUBMITTED" as const,
    trackTags: ["AI/ML", "Creative Tech"],
    evaluationStatus: "COMPLETED" as const,
    existingEvaluation: {
      compositeScore: 8.5,
      notes: "Solid work on canvas engine.",
      isDraft: false,
      scores: [
        { criterionId: "c-1", score: 8 },
        { criterionId: "c-2", score: 9 },
      ],
    },
  },
  {
    id: "p-2",
    title: "EcoTrack IoT",
    tagline: "Edge sensor monitoring for smart campuses",
    description: "Low-power mesh sensors tracking energy consumption.",
    repositoryUrl: "https://github.com/example/ecotrack",
    demoUrl: null,
    videoUrl: "https://youtube.com/watch?v=123",
    status: "SUBMITTED" as const,
    trackTags: ["IoT", "Sustainability"],
    evaluationStatus: "PENDING" as const,
  },
  {
    id: "p-3",
    title: "DeFi MicroCredit",
    tagline: "Peer-to-peer micro-lending protocol",
    description: "Zero-knowledge decentralized credit scoring.",
    repositoryUrl: "https://github.com/example/defi-credit",
    demoUrl: null,
    videoUrl: null,
    status: "SUBMITTED" as const,
    trackTags: ["Fintech", "Web3"],
    evaluationStatus: "DRAFT" as const,
    existingEvaluation: {
      compositeScore: 7.0,
      notes: "Pending tokenomics review.",
      isDraft: true,
      scores: [{ criterionId: "c-1", score: 7 }],
    },
  },
];

describe("JudgePortal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders portal header, event title, progress bar, and project cards", () => {
    render(
      <JudgePortal
        eventId="evt-1"
        eventSlug="hack-autumn-2026"
        eventTitle="Hack Autumn 2026"
        criteria={mockCriteria}
        projects={mockProjects}
        currentJudgeId="judge-10"
      />
    );

    expect(screen.getByText("Hack Autumn 2026")).toBeInTheDocument();
    expect(screen.getByText(/1\/3 Evaluated/i)).toBeInTheDocument();
    expect(screen.getByText("AI Canvas Studio")).toBeInTheDocument();
    expect(screen.getByText("EcoTrack IoT")).toBeInTheDocument();
    expect(screen.getByText("DeFi MicroCredit")).toBeInTheDocument();
  });

  it("filters project cards when filter pills are selected", () => {
    render(
      <JudgePortal
        eventId="evt-1"
        eventSlug="hack-autumn-2026"
        eventTitle="Hack Autumn 2026"
        criteria={mockCriteria}
        projects={mockProjects}
        currentJudgeId="judge-10"
      />
    );

    // Select "Pending Review" -> shows EcoTrack IoT (PENDING) and DeFi MicroCredit (DRAFT)
    const pendingPill = screen.getByRole("button", {
      name: /pending review/i,
    });
    fireEvent.click(pendingPill);

    expect(screen.getByText("EcoTrack IoT")).toBeInTheDocument();
    expect(screen.getByText("DeFi MicroCredit")).toBeInTheDocument();
    expect(screen.queryByText("AI Canvas Studio")).not.toBeInTheDocument();

    // Select "Completed" -> shows AI Canvas Studio
    const completedPill = screen.getByRole("button", {
      name: /completed/i,
    });
    fireEvent.click(completedPill);

    expect(screen.getByText("AI Canvas Studio")).toBeInTheDocument();
    expect(screen.queryByText("EcoTrack IoT")).not.toBeInTheDocument();
    expect(screen.queryByText("DeFi MicroCredit")).not.toBeInTheDocument();
  });

  it("filters project cards by search query", () => {
    render(
      <JudgePortal
        eventId="evt-1"
        eventSlug="hack-autumn-2026"
        eventTitle="Hack Autumn 2026"
        criteria={mockCriteria}
        projects={mockProjects}
        currentJudgeId="judge-10"
      />
    );

    const searchInput = screen.getByPlaceholderText(
      /search projects by title or track/i
    );
    fireEvent.change(searchInput, { target: { value: "Sustainability" } });

    expect(screen.getByText("EcoTrack IoT")).toBeInTheDocument();
    expect(screen.queryByText("AI Canvas Studio")).not.toBeInTheDocument();
    expect(screen.queryByText("DeFi MicroCredit")).not.toBeInTheDocument();
  });

  it("opens scorecard modal and optimistically updates card state on evaluation submission", async () => {
    render(
      <JudgePortal
        eventId="evt-1"
        eventSlug="hack-autumn-2026"
        eventTitle="Hack Autumn 2026"
        criteria={mockCriteria}
        projects={mockProjects}
        currentJudgeId="judge-10"
      />
    );

    // Click "Evaluate Project" on EcoTrack IoT
    const evaluateBtns = screen.getAllByRole("button", {
      name: /evaluate project|resume evaluation|review \/ edit/i,
    });
    // The second project is EcoTrack IoT
    fireEvent.click(evaluateBtns[1]);

    expect(screen.getByTestId("mock-scorecard-modal")).toBeInTheDocument();
    expect(
      screen.getByText("Modal for EcoTrack IoT")
    ).toBeInTheDocument();

    // Trigger mock submit
    const mockSubmitBtn = screen.getByText("Mock Submit Final");
    fireEvent.click(mockSubmitBtn);

    // Modal closes
    await waitFor(() => {
      expect(
        screen.queryByTestId("mock-scorecard-modal")
      ).not.toBeInTheDocument();
    });

    // Progress bar now shows 2/3 Evaluated
    expect(screen.getByText(/2\/3 Evaluated/i)).toBeInTheDocument();
  });

  it("enforces strict zero-radius styling across portal cards and container", () => {
    const { container } = render(
      <JudgePortal
        eventId="evt-1"
        eventSlug="hack-autumn-2026"
        eventTitle="Hack Autumn 2026"
        criteria={mockCriteria}
        projects={mockProjects}
        currentJudgeId="judge-10"
      />
    );

    const roundedElements = container.querySelectorAll(
      "[class*='rounded-sm'], [class*='rounded-md'], [class*='rounded-lg'], [class*='rounded-xl'], [class*='rounded-full']"
    );
    expect(roundedElements.length).toBe(0);
  });
});
