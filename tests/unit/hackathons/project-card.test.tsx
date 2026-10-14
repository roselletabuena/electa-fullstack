import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ProjectCard } from "@/features/hackathons/components/project-card";
import type { ProjectSubmissionDto } from "@/features/hackathons/types/submission";

describe("ProjectCard Component", () => {
  const mockSubmission: ProjectSubmissionDto = {
    id: "proj-123",
    eventId: "event-manila-2026",
    teamLeadId: "lead-456",
    title: "zkVoting Shield",
    tagline: "Zero-knowledge proof ballot confidentiality",
    description: "An end-to-end verifiable cryptographic voting shield for hackathons and student governance.",
    repositoryUrl: "https://github.com/zk-team/zk-voting-shield",
    demoUrl: "https://demo.zkvoting.io",
    videoUrl: "https://youtube.com/watch?v=shielddemo",
    status: "ACCEPTED",
    createdAt: "2026-10-14T10:00:00.000Z",
    updatedAt: "2026-10-14T10:00:00.000Z",
    members: [
      {
        id: "mem-1",
        submissionId: "proj-123",
        name: "Satoshi Nakamoto",
        email: "satoshi@example.com",
        role: "Lead Architect",
        createdAt: "2026-10-14T10:00:00.000Z",
      },
      {
        id: "mem-2",
        submissionId: "proj-123",
        name: "Ada Lovelace",
        email: "ada@example.com",
        role: "Cryptographer",
        createdAt: "2026-10-14T10:00:00.000Z",
      },
    ],
    trackTags: [
      {
        id: "tag-1",
        submissionId: "proj-123",
        trackName: "AI & Agents",
        createdAt: "2026-10-14T10:00:00.000Z",
      },
      {
        id: "tag-2",
        submissionId: "proj-123",
        trackName: "Web3",
        createdAt: "2026-10-14T10:00:00.000Z",
      },
    ],
    links: [
      {
        id: "link-1",
        submissionId: "proj-123",
        label: "Documentation",
        url: "https://docs.zkvoting.io",
        createdAt: "2026-10-14T10:00:00.000Z",
      },
    ],
  };

  it("renders project title, tagline, description, and status (Scenario 1 Happy Path)", () => {
    render(<ProjectCard submission={mockSubmission} />);

    expect(screen.getByText("zkVoting Shield")).toBeDefined();
    expect(
      screen.getByText("Zero-knowledge proof ballot confidentiality")
    ).toBeDefined();
    expect(
      screen.getByText(
        "An end-to-end verifiable cryptographic voting shield for hackathons and student governance."
      )
    ).toBeDefined();
    expect(screen.getByText("ACCEPTED")).toBeDefined();
  });

  it("renders track badges", () => {
    render(<ProjectCard submission={mockSubmission} />);

    expect(screen.getByText("AI & Agents")).toBeDefined();
    expect(screen.getByText("Web3")).toBeDefined();
  });

  it("renders accessible external links with rel=noopener noreferrer (Scenario 1 Happy Path)", () => {
    render(<ProjectCard submission={mockSubmission} />);

    const repoLink = screen.getByLabelText("View source code repository for zkVoting Shield");
    expect(repoLink.getAttribute("href")).toBe(
      "https://github.com/zk-team/zk-voting-shield"
    );
    expect(repoLink.getAttribute("target")).toBe("_blank");
    expect(repoLink.getAttribute("rel")).toContain("noopener");
    expect(repoLink.getAttribute("rel")).toContain("noreferrer");

    const demoLink = screen.getByLabelText("Open live demo for zkVoting Shield");
    expect(demoLink.getAttribute("href")).toBe("https://demo.zkvoting.io");
    expect(demoLink.getAttribute("target")).toBe("_blank");
    expect(demoLink.getAttribute("rel")).toContain("noopener");

    const videoLink = screen.getByLabelText("Watch presentation video for zkVoting Shield");
    expect(videoLink.getAttribute("href")).toBe("https://youtube.com/watch?v=shielddemo");
    expect(videoLink.getAttribute("target")).toBe("_blank");
  });

  it("renders team members roster", () => {
    render(<ProjectCard submission={mockSubmission} />);

    expect(screen.getByText(/Satoshi Nakamoto, Ada Lovelace/i)).toBeDefined();
  });

  it("renders gracefully when optional links and tagline are omitted", () => {
    const minimalSubmission: ProjectSubmissionDto = {
      ...mockSubmission,
      id: "proj-minimal",
      tagline: null,
      demoUrl: null,
      videoUrl: null,
      members: [],
      trackTags: [],
      links: [],
    };

    render(<ProjectCard submission={minimalSubmission} />);

    expect(screen.getByText("General Track")).toBeDefined();
    expect(screen.queryByLabelText(/Open live demo/i)).toBeNull();
    expect(screen.queryByLabelText(/Watch presentation video/i)).toBeNull();
  });
});
