import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  TaxonomyDeleteDialog,
  type DeletionTarget,
} from "@/features/events/components/dashboard/TaxonomyDeleteDialog";

describe("TaxonomyDeleteDialog", () => {
  it("renders blocker dialog when division has registered contestants", () => {
    const target: DeletionTarget = {
      type: "division",
      id: "div_1",
      name: "Female Category",
      contestantCount: 5,
    };

    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <TaxonomyDeleteDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        target={target}
        isDeleting={false}
      />,
    );

    expect(screen.getByText("Cannot Delete Division")).toBeDefined();
    expect(screen.getByText(/currently has/i)).toBeDefined();
    expect(screen.getByText(/5 registered contestants/i)).toBeDefined();
    expect(
      screen.getByText(
        /To safeguard competition integrity, you must reassign or remove all contestants/i,
      ),
    ).toBeDefined();

    // Check "Understood" button is present and clicks
    const understoodBtn = screen.getByRole("button", { name: /understood/i });
    expect(understoodBtn).toBeDefined();
    fireEvent.click(understoodBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders destructive confirmation dialog when target has 0 contestants", async () => {
    const target: DeletionTarget = {
      type: "awardCategory",
      id: "award_1",
      name: "People's Choice Award",
      contestantCount: 0,
    };

    const onClose = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <TaxonomyDeleteDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        target={target}
        isDeleting={false}
      />,
    );

    expect(screen.getByText("Delete Award Category?")).toBeDefined();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeDefined();

    const deleteBtn = screen.getByRole("button", { name: /yes, delete/i });
    expect(deleteBtn).toBeDefined();

    fireEvent.click(deleteBtn);
    expect(onConfirm).toHaveBeenCalled();
  });
});
