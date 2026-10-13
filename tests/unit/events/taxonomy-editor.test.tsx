import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaxonomyEditor } from "@/features/events/components/taxonomy-editor";
import type {
  WizardPositionDraftInput,
  WizardDivisionDraftInput,
  WizardAwardDraftInput,
} from "@/lib/validations/archetype-wizard";

describe("TaxonomyEditor Component", () => {
  const defaultPositions: WizardPositionDraftInput[] = [
    {
      name: "President",
      description: "Executive head",
      maxSelectionsPerVoter: 1,
      minSelectionsPerVoter: 0,
      displayOrder: 1,
    },
  ];

  const defaultDivisions: WizardDivisionDraftInput[] = [
    {
      name: "Female Category",
      description: "Bracket A",
      displayOrder: 1,
    },
  ];

  const defaultAwards: WizardAwardDraftInput[] = [
    {
      name: "People's Choice",
      isVotingOpen: true,
      displayOrder: 1,
    },
  ];

  it("renders positions for student council with max seats", () => {
    const onPositionsChange = vi.fn();
    render(
      <TaxonomyEditor
        archetype="STUDENT_COUNCIL"
        positions={defaultPositions}
        onPositionsChange={onPositionsChange}
        divisions={[]}
        onDivisionsChange={vi.fn()}
        awardCategories={[]}
        onAwardCategoriesChange={vi.fn()}
      />
    );

    expect(screen.getByText("Office / Position Configuration")).toBeDefined();
    expect(screen.getByText("President")).toBeDefined();
    expect(screen.getByText("Single Seat (1)")).toBeDefined();
  });

  it("adds a new position with multi-seat selection limit", () => {
    const onPositionsChange = vi.fn();
    render(
      <TaxonomyEditor
        archetype="STUDENT_COUNCIL"
        positions={defaultPositions}
        onPositionsChange={onPositionsChange}
        divisions={[]}
        onDivisionsChange={vi.fn()}
        awardCategories={[]}
        onAwardCategoriesChange={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText(/Office \/ Position Name/i);
    const maxInput = screen.getByLabelText(/Max Seats \/ Selections/i);

    fireEvent.change(nameInput, { target: { value: "Senators" } });
    fireEvent.change(maxInput, { target: { value: "5" } });

    const submitBtn = screen.getByRole("button", { name: /Add Office \/ Position/i });
    fireEvent.click(submitBtn);

    expect(onPositionsChange).toHaveBeenCalledWith([
      ...defaultPositions,
      expect.objectContaining({
        name: "Senators",
        maxSelectionsPerVoter: 5,
        minSelectionsPerVoter: 0,
      }),
    ]);
  });

  it("loads standard presets when Load Presets button is clicked", () => {
    const onPositionsChange = vi.fn();
    render(
      <TaxonomyEditor
        archetype="HACKATHON"
        positions={[]}
        onPositionsChange={onPositionsChange}
        divisions={[]}
        onDivisionsChange={vi.fn()}
        awardCategories={[]}
        onAwardCategoriesChange={vi.fn()}
      />
    );

    const presetBtn = screen.getByRole("button", { name: /Load Presets/i });
    fireEvent.click(presetBtn);

    expect(onPositionsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "Track A - Web & Cloud" }),
        expect.objectContaining({ name: "Track B - AI & Intelligent Agents" }),
      ])
    );
  });

  it("removes a position when the delete button is clicked", () => {
    const onPositionsChange = vi.fn();
    render(
      <TaxonomyEditor
        archetype="STUDENT_COUNCIL"
        positions={defaultPositions}
        onPositionsChange={onPositionsChange}
        divisions={[]}
        onDivisionsChange={vi.fn()}
        awardCategories={[]}
        onAwardCategoriesChange={vi.fn()}
      />
    );

    const removeBtn = screen.getByRole("button", { name: /Remove President/i });
    fireEvent.click(removeBtn);

    expect(onPositionsChange).toHaveBeenCalledWith([]);
  });

  it("shows an error when adding an empty name", () => {
    const onPositionsChange = vi.fn();
    render(
      <TaxonomyEditor
        archetype="STUDENT_COUNCIL"
        positions={[]}
        onPositionsChange={onPositionsChange}
        divisions={[]}
        onDivisionsChange={vi.fn()}
        awardCategories={[]}
        onAwardCategoriesChange={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /Add Office \/ Position/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole("alert")).toBeDefined();
    expect(onPositionsChange).not.toHaveBeenCalled();
  });
});
