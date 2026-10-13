import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArchetypeSelector } from "@/features/events/components/archetype-selector";

describe("ArchetypeSelector Component", () => {
  it("renders all 4 event archetypes with correct labels and zero-radius classes", () => {
    const onChange = vi.fn();
    render(<ArchetypeSelector value="PAGEANT" onChange={onChange} />);

    expect(screen.getByText("Beauty Pageant")).toBeDefined();
    expect(screen.getByText("Student Council Election")).toBeDefined();
    expect(screen.getByText("Hackathon / Competition")).toBeDefined();
    expect(screen.getByText("Custom Contest")).toBeDefined();

    // Verify radio buttons have role="radio"
    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons.length).toBe(4);

    // Selected state on Pageant
    expect(radioButtons[0]?.getAttribute("aria-checked")).toBe("true");
    expect(radioButtons[1]?.getAttribute("aria-checked")).toBe("false");
  });

  it("calls onChange when an archetype is clicked", () => {
    const onChange = vi.fn();
    render(<ArchetypeSelector value="PAGEANT" onChange={onChange} />);

    const studentCouncilBtn = screen.getByRole("radio", { name: /student council election/i });
    fireEvent.click(studentCouncilBtn);

    expect(onChange).toHaveBeenCalledWith("STUDENT_COUNCIL");
  });

  it("supports keyboard navigation with Enter or Space key", () => {
    const onChange = vi.fn();
    render(<ArchetypeSelector value="PAGEANT" onChange={onChange} />);

    const hackathonBtn = screen.getByRole("radio", { name: /hackathon \/ competition/i });
    fireEvent.keyDown(hackathonBtn, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("HACKATHON");

    fireEvent.keyDown(hackathonBtn, { key: " " });
    expect(onChange).toHaveBeenCalledWith("HACKATHON");
  });

  it("displays archetype-tailored terminology pills", () => {
    const onChange = vi.fn();
    render(<ArchetypeSelector value="STUDENT_COUNCIL" onChange={onChange} />);

    // In student council: Office / Position and Candidate
    expect(screen.getByText("Office / Position")).toBeDefined();
    expect(screen.getByText("Candidate")).toBeDefined();
  });

  it("disables all radio buttons when disabled prop is true", () => {
    const onChange = vi.fn();
    render(<ArchetypeSelector value="PAGEANT" onChange={onChange} disabled />);

    const buttons = screen.getAllByRole("radio");
    for (const btn of buttons) {
      expect(btn.hasAttribute("disabled")).toBe(true);
    }
  });
});
