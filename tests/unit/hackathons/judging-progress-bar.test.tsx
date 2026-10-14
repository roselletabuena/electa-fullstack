import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JudgingProgressBar } from "@/features/hackathons/components/judging-progress-bar";

describe("JudgingProgressBar Component", () => {
  it("renders evaluated count, total count, and correct percentage", () => {
    render(
      <JudgingProgressBar
        totalCount={10}
        evaluatedCount={7}
        activeFilter="ALL"
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.getByText(/7\/10 Evaluated/i)).toBeInTheDocument();
    expect(screen.getByText(/70%/i)).toBeInTheDocument();

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "7");
    expect(progressBar).toHaveAttribute("aria-valuemax", "10");
  });

  it("handles zero total count gracefully without NaN", () => {
    render(
      <JudgingProgressBar
        totalCount={0}
        evaluatedCount={0}
        activeFilter="ALL"
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.getByText(/0\/0 Evaluated/i)).toBeInTheDocument();
    expect(screen.getByText(/0%/i)).toBeInTheDocument();
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "0");
  });

  it("renders filter controls and triggers onFilterChange", () => {
    const handleFilterChange = vi.fn();
    render(
      <JudgingProgressBar
        totalCount={10}
        evaluatedCount={7}
        activeFilter="ALL"
        onFilterChange={handleFilterChange}
      />
    );

    const pendingBtn = screen.getByRole("button", { name: /pending review/i });
    fireEvent.click(pendingBtn);
    expect(handleFilterChange).toHaveBeenCalledWith("PENDING");

    const completedBtn = screen.getByRole("button", { name: /completed/i });
    fireEvent.click(completedBtn);
    expect(handleFilterChange).toHaveBeenCalledWith("COMPLETED");

    const allBtn = screen.getByRole("button", { name: /^all/i });
    fireEvent.click(allBtn);
    expect(handleFilterChange).toHaveBeenCalledWith("ALL");
  });

  it("applies strict zero-radius styling", () => {
    const { container } = render(
      <JudgingProgressBar
        totalCount={10}
        evaluatedCount={7}
        activeFilter="ALL"
        onFilterChange={vi.fn()}
      />
    );

    const roundedElements = container.querySelectorAll(
      "[class*='rounded-sm'], [class*='rounded-md'], [class*='rounded-lg'], [class*='rounded-xl'], [class*='rounded-full']"
    );
    expect(roundedElements.length).toBe(0);
  });
});
