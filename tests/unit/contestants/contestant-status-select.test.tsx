import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ContestantStatusSelect } from "@/features/contestants/components/ContestantStatusSelect";

describe("ContestantStatusSelect Component", () => {
  it("renders the active status badge with proper label and accessible text", () => {
    render(
      <ContestantStatusSelect
        status="ACTIVE"
        contestantId="c-1"
        contestantName="Maria Clara"
        onStatusChange={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", {
      name: /Change status for Maria Clara, current status: ACTIVE/i,
    });
    expect(button).toBeDefined();
    expect(button.textContent).toContain("ACTIVE");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-haspopup")).toBe("listbox");
  });

  it("renders HIDDEN and WITHDRAWN statuses properly", () => {
    const { rerender } = render(
      <ContestantStatusSelect
        status="HIDDEN"
        contestantName="Maria Clara"
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /current status: HIDDEN/i })).toBeDefined();

    rerender(
      <ContestantStatusSelect
        status="WITHDRAWN"
        contestantName="Maria Clara"
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /current status: WITHDRAWN/i })).toBeDefined();
  });

  it("opens the listbox menu when clicked, displaying all 3 status options", () => {
    render(
      <ContestantStatusSelect
        status="ACTIVE"
        contestantName="Maria Clara"
        onStatusChange={vi.fn()}
      />,
    );

    const trigger = screen.getByRole("button", { name: /current status: ACTIVE/i });
    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const listbox = screen.getByRole("listbox", { name: /Contestant status options/i });
    expect(listbox).toBeDefined();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]?.textContent).toContain("ACTIVE");
    expect(options[1]?.textContent).toContain("HIDDEN");
    expect(options[2]?.textContent).toContain("WITHDRAWN");
  });

  it("calls onStatusChange with the selected status when an option is clicked and closes the menu", () => {
    const handleStatusChange = vi.fn();

    render(
      <ContestantStatusSelect
        status="ACTIVE"
        contestantName="Maria Clara"
        onStatusChange={handleStatusChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: /current status: ACTIVE/i });
    fireEvent.click(trigger);

    const hiddenOption = screen.getByRole("option", { name: /HIDDEN/i });
    fireEvent.click(hiddenOption);

    expect(handleStatusChange).toHaveBeenCalledWith("HIDDEN");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("does not call onStatusChange if the already selected status is clicked", () => {
    const handleStatusChange = vi.fn();

    render(
      <ContestantStatusSelect
        status="ACTIVE"
        contestantName="Maria Clara"
        onStatusChange={handleStatusChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: /current status: ACTIVE/i });
    fireEvent.click(trigger);

    const activeOption = screen.getByRole("option", { name: /ACTIVE/i });
    fireEvent.click(activeOption);

    expect(handleStatusChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("closes the menu when Escape key is pressed", () => {
    render(
      <ContestantStatusSelect
        status="ACTIVE"
        contestantName="Maria Clara"
        onStatusChange={vi.fn()}
      />,
    );

    const trigger = screen.getByRole("button", { name: /current status: ACTIVE/i });
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeDefined();

    const menu = screen.getByRole("listbox");
    fireEvent.keyDown(menu, { key: "Escape" });

    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("closes the menu when clicking outside", async () => {
    render(
      <div>
        <div data-testid="outside">Outside area</div>
        <ContestantStatusSelect
          status="ACTIVE"
          contestantName="Maria Clara"
          onStatusChange={vi.fn()}
        />
      </div>,
    );

    const trigger = screen.getByRole("button", { name: /current status: ACTIVE/i });
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeDefined();

    fireEvent.mouseDown(screen.getByTestId("outside"));

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });

  it("disables the button and prevents opening when disabled is true", () => {
    render(
      <ContestantStatusSelect
        status="ACTIVE"
        contestantName="Maria Clara"
        onStatusChange={vi.fn()}
        disabled={true}
      />,
    );

    const trigger = screen.getByRole("button");
    expect(trigger).toHaveProperty("disabled", true);

    fireEvent.click(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
