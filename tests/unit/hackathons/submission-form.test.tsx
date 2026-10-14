import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { SubmissionForm } from "@/features/hackathons/components/submission-form";
import { submitProjectAction } from "@/features/hackathons/actions/submit-project";

vi.mock("@/features/hackathons/actions/submit-project", () => ({
  submitProjectAction: vi.fn(),
}));

describe("SubmissionForm Component", () => {
  const eventSlug = "eth-manila-2026";
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <SubmissionForm
        eventSlug={eventSlug}
        isOpen={false}
        onClose={onClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("triggers inline validation errors on incomplete submission form (Scenario 2)", async () => {
    render(
      <SubmissionForm
        eventSlug={eventSlug}
        isOpen={true}
        onClose={onClose}
        availableTracks={["AI & Agents", "Web3"]}
      />
    );

    // Try submitting empty form
    const submitBtn = screen.getByRole("button", { name: /Submit Project/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Title must be at least 3 characters/i)).toBeDefined();
    expect(screen.getByText(/Description must be at least 10 characters/i)).toBeDefined();
    expect(screen.getByText(/Repository URL is required/i)).toBeDefined();
    expect(screen.getByText(/Select at least one track tag/i)).toBeDefined();

    expect(submitProjectAction).not.toHaveBeenCalled();
  });

  it("triggers validation error on non-GitHub/GitLab repository URL", async () => {
    render(
      <SubmissionForm
        eventSlug={eventSlug}
        isOpen={true}
        onClose={onClose}
        availableTracks={["AI & Agents"]}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/Autonomous Voting Node/i), {
      target: { value: "Valid Title" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Explain the problem solved/i), {
      target: { value: "A comprehensive description of the hackathon solution and tech stack." },
    });
    fireEvent.change(screen.getByPlaceholderText(/github.com\/organization\/repository/i), {
      target: { value: "https://mysite.com/not-git" },
    });

    // Select track
    fireEvent.click(screen.getByRole("button", { name: "AI & Agents" }));

    const submitBtn = screen.getByRole("button", { name: /Submit Project/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Must be a valid GitHub or GitLab repository URL/i)).toBeDefined();
    expect(submitProjectAction).not.toHaveBeenCalled();
  });

  it("submits successfully with valid data and calls onSuccess", async () => {
    const mockCreated = {
      id: "sub-999",
      eventId: "evt-1",
      teamLeadId: "lead-1",
      title: "Zero Gas Relayer",
      tagline: "Instant gasless transactions",
      description: "A complete decentralized gasless relayer network for student voters.",
      repositoryUrl: "https://github.com/myteam/zero-gas-relayer",
      demoUrl: "https://demo.zerogas.io",
      videoUrl: null,
      status: "SUBMITTED" as const,
      createdAt: "2026-10-14T12:00:00.000Z",
      updatedAt: "2026-10-14T12:00:00.000Z",
      members: [],
      trackTags: [{ id: "t1", submissionId: "sub-999", trackName: "AI & Agents", createdAt: "" }],
      links: [],
    };

    vi.mocked(submitProjectAction).mockResolvedValue({
      success: true,
      data: mockCreated,
    });

    render(
      <SubmissionForm
        eventSlug={eventSlug}
        isOpen={true}
        onClose={onClose}
        availableTracks={["AI & Agents"]}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/Autonomous Voting Node/i), {
      target: { value: "Zero Gas Relayer" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Explain the problem solved/i), {
      target: { value: "A complete decentralized gasless relayer network for student voters." },
    });
    fireEvent.change(screen.getByPlaceholderText(/github.com\/organization\/repository/i), {
      target: { value: "https://github.com/myteam/zero-gas-relayer" },
    });

    // Select track
    fireEvent.click(screen.getByRole("button", { name: "AI & Agents" }));

    const submitBtn = screen.getByRole("button", { name: /Submit Project/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitProjectAction).toHaveBeenCalledWith(
        eventSlug,
        expect.objectContaining({
          title: "Zero Gas Relayer",
          repositoryUrl: "https://github.com/myteam/zero-gas-relayer",
          trackTags: ["AI & Agents"],
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("submission-success-banner")).toBeDefined();
      expect(onSuccess).toHaveBeenCalledWith(mockCreated);
    });
  });
});
