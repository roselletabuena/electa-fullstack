import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArchetypeSelector } from "@/features/events/components/archetype-selector";

describe("ArchetypeSelector Component (VS-117 Non-Pageant Archetypes Disabled)", () => {
  it("renders all 4 event archetypes with zero-radius styling", () => {
    const onChange = vi.fn();
    render(<ArchetypeSelector value="PAGEANT" onChange={onChange} />);

    expect(screen.getByText("Beauty Pageant")).toBeDefined();
    expect(screen.getByText("Student Council Election")).toBeDefined();
    expect(screen.getByText("Hackathon / Competition")).toBeDefined();
    expect(screen.getByText("Custom Contest")).toBeDefined();

    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(4);

    // Selected state on Pageant
    expect(radioButtons[0]?.getAttribute("aria-checked")).toBe("true");
    expect(radioButtons[1]?.getAttribute("aria-checked")).toBe("false");
    expect(radioButtons[2]?.getAttribute("aria-checked")).toBe("false");
    expect(radioButtons[3]?.getAttribute("aria-checked")).toBe("false");
  });

  it("Scenario 1: Happy Path - Pageant selection is active with Selected indicator and responds to interaction", () => {
    const onChange = vi.fn();
    render(<ArchetypeSelector value="PAGEANT" onChange={onChange} />);

    const pageantBtn = screen.getByRole("radio", { name: /beauty pageant/i });
    expect(pageantBtn.getAttribute("aria-checked")).toBe("true");
    expect(pageantBtn.getAttribute("aria-disabled")).toBeNull();
    expect(screen.getByText("Selected")).toBeDefined();

    // Clicking pageant triggers onChange
    fireEvent.click(pageantBtn);
    expect(onChange).toHaveBeenCalledWith("PAGEANT");

    // Keyboard activation (Enter / Space) triggers onChange
    onChange.mockClear();
    fireEvent.keyDown(pageantBtn, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("PAGEANT");

    onChange.mockClear();
    fireEvent.keyDown(pageantBtn, { key: " " });
    expect(onChange).toHaveBeenCalledWith("PAGEANT");
  });

  it("Scenario 2: Disabled Archetypes render prominent COMING SOON badges and disabled styling", () => {
    const onChange = vi.fn();
    render(<ArchetypeSelector value="PAGEANT" onChange={onChange} />);

    // 3 badges for the 3 coming soon archetypes
    const badges = screen.getAllByTestId("coming-soon-badge");
    expect(badges).toHaveLength(3);
    for (const badge of badges) {
      expect(badge.textContent).toBe("COMING SOON");
      expect(badge.className).toContain("border-amber-300");
      expect(badge.className).toContain("bg-amber-100");
      expect(badge.className).toContain("text-amber-900");
      expect(badge.className).toContain("rounded-none");
    }

    // Verify aria-disabled="true" and disabled styling on all 3 non-pageant cards
    const studentCouncilBtn = screen.getByRole("radio", { name: /student council election/i });
    const hackathonBtn = screen.getByRole("radio", { name: /hackathon \/ competition/i });
    const customBtn = screen.getByRole("radio", { name: /custom contest/i });

    for (const btn of [studentCouncilBtn, hackathonBtn, customBtn]) {
      expect(btn.getAttribute("aria-disabled")).toBe("true");
      expect(btn.className).toContain("opacity-60");
      expect(btn.className).toContain("cursor-not-allowed");
    }
  });

  it("Scenario 2 (cont.): Clicking or pressing Enter/Space on disabled archetypes does not select them", () => {
    const onChange = vi.fn();
    render(<ArchetypeSelector value="PAGEANT" onChange={onChange} />);

    const studentCouncilBtn = screen.getByRole("radio", { name: /student council election/i });
    const hackathonBtn = screen.getByRole("radio", { name: /hackathon \/ competition/i });
    const customBtn = screen.getByRole("radio", { name: /custom contest/i });

    // Click suppression
    fireEvent.click(studentCouncilBtn);
    fireEvent.click(hackathonBtn);
    fireEvent.click(customBtn);
    expect(onChange).not.toHaveBeenCalled();

    // Keyboard suppression with Enter
    fireEvent.keyDown(studentCouncilBtn, { key: "Enter" });
    fireEvent.keyDown(hackathonBtn, { key: "Enter" });
    fireEvent.keyDown(customBtn, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();

    // Keyboard suppression with Space
    fireEvent.keyDown(studentCouncilBtn, { key: " " });
    fireEvent.keyDown(hackathonBtn, { key: " " });
    fireEvent.keyDown(customBtn, { key: " " });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("displays archetype-tailored terminology pills", () => {
    const onChange = vi.fn();
    render(<ArchetypeSelector value="PAGEANT" onChange={onChange} />);

    // In pageant: Division and Contestant
    expect(screen.getByText("Division")).toBeDefined();
    expect(screen.getByText("Contestant")).toBeDefined();
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
