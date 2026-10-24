import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ContestantFormModal } from "@/features/contestants/components/ContestantFormModal";
import type {
  AwardCategoryDto,
  ContestantDto,
  DynamicDivisionItem,
} from "@/features/contestants/types";

describe("ContestantFormModal - Dynamic Category & Division Integration (VS-38)", () => {
  const mockCategories: AwardCategoryDto[] = [
    {
      id: "cat-1",
      eventId: "evt-1",
      name: "People's Choice Award",
      description: "Voted by the public",
      isVotingOpen: true,
    },
    {
      id: "cat-2",
      eventId: "evt-1",
      name: "Best in Swimsuit",
      description: "Stage performance",
      isVotingOpen: true,
    },
  ];

  const mockCustomDivisions: DynamicDivisionItem[] = [
    { id: "div-kids", name: "Kids" },
    { id: "div-teens", name: "Teens" },
    { id: "div-adults", name: "Adults" },
  ];

  const mockInitialData: ContestantDto = {
    id: "c1",
    eventId: "evt-1",
    contestantNumber: 5,
    name: "Maria Santos",
    division: "TEEN",
    divisionId: "div-teens",
    divisionName: "Teens",
    status: "ACTIVE",
    avatarUrl: "https://example.com/avatar.jpg",
    voteCount: 0,
    media: [
      {
        id: "m1",
        mediaType: "PHOTO",
        url: "https://example.com/avatar.jpg",
        embedPlatform: "NONE",
        displayOrder: 0,
        aspectRatio: "4:5",
        isCover: true,
      },
    ],
    categories: mockCategories.slice(0, 1),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("renders custom event divisions in the dropdown when divisions prop is provided", () => {
    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
        divisions={mockCustomDivisions}
      />,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select).toBeDefined();

    // Check that optional placeholder and custom division options are rendered
    expect(screen.getByRole("option", { name: "No Division (Optional)" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Kids" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Teens" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Adults" })).toBeDefined();

    // Fallback static enums should NOT be present when custom divisions exist
    expect(screen.queryByRole("option", { name: "Female" })).toBeNull();
    expect(screen.queryByRole("option", { name: "LGBTQ+" })).toBeNull();
  });

  it("does not render division dropdown when divisions prop is empty or undefined", () => {
    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
        divisions={[]}
      />,
    );

    // Division select should not be rendered when event has no configured divisions
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByLabelText(/division/i)).toBeNull();
    expect(screen.queryByRole("option", { name: "Female" })).toBeNull();
    expect(screen.queryByRole("option", { name: "Male" })).toBeNull();
    expect(screen.queryByRole("option", { name: "LGBTQ+" })).toBeNull();
    expect(screen.queryByRole("option", { name: "Teen" })).toBeNull();
  });

  it("renders award category checkboxes for active event awards", () => {
    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
        divisions={mockCustomDivisions}
      />,
    );

    expect(screen.getByText("People's Choice Award")).toBeDefined();
    expect(screen.getByText("Best in Swimsuit")).toBeDefined();
  });

  it("pre-selects existing custom division and categories when editing an existing contestant", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        categories={mockCategories}
        divisions={mockCustomDivisions}
        initialData={mockInitialData}
      />,
    );

    // Division dropdown should be populated with the contestant's division
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("Teens");

    // Change division to "Adults"
    fireEvent.change(select, { target: { value: "Adults" } });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /Update Profile/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Maria Santos",
        division: "Adults",
        divisionId: "div-adults",
      }),
    );
  });

  it("submits undefined divisionId when No Division (Optional) is chosen", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        categories={mockCategories}
        divisions={mockCustomDivisions}
        initialData={mockInitialData}
      />,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "" } });

    const submitBtn = screen.getByRole("button", { name: /Update Profile/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        divisionId: undefined,
      }),
    );
  });

  it("navigates between Core Profile and Extended Details tabs and exposes accessible tab roles", () => {
    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
        divisions={mockCustomDivisions}
        initialData={mockInitialData}
      />,
    );

    const coreTab = screen.getByRole("tab", { name: /01\. Core Profile/i });
    const extendedTab = screen.getByRole("tab", { name: /02\. Extended Details/i });

    expect(coreTab).toBeDefined();
    expect(extendedTab).toBeDefined();

    expect(coreTab.getAttribute("aria-selected")).toBe("true");
    expect(extendedTab.getAttribute("aria-selected")).toBe("false");

    // Click extended tab
    fireEvent.click(extendedTab);
    expect(extendedTab.getAttribute("aria-selected")).toBe("true");
    expect(coreTab.getAttribute("aria-selected")).toBe("false");

    // Click "Core Profile" back button in footer
    const backBtn = screen.getByRole("button", { name: /Core Profile/i });
    fireEvent.click(backBtn);
    expect(coreTab.getAttribute("aria-selected")).toBe("true");

    // Click "Extended Details" next button in footer
    const nextBtn = screen.getByRole("button", { name: /Extended Details/i });
    fireEvent.click(nextBtn);
    expect(extendedTab.getAttribute("aria-selected")).toBe("true");
  });

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <ContestantFormModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={vi.fn()}
        categories={mockCategories}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("associates labels with their respective input elements via htmlFor", () => {
    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
      />,
    );

    expect(screen.getByLabelText(/Candidate #/i)).toBeDefined();
    expect(screen.getByLabelText(/Full Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Hometown/i)).toBeDefined();
    expect(screen.getByLabelText(/Height/i)).toBeDefined();
    expect(screen.getByLabelText(/Official Advocacy Statement/i)).toBeDefined();
    expect(screen.getByLabelText(/Biography/i)).toBeDefined();
  });

  it("indicates required fields with asterisks and optional fields clearly without visual clutter", () => {
    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
        divisions={mockCustomDivisions}
      />,
    );

    // Verify clean required asterisks exist for candidate number and name
    const requiredIndicators = screen.getAllByTitle(/Required field/i);
    expect(requiredIndicators.length).toBeGreaterThanOrEqual(2);

    // Verify optional fields (such as Hometown and Division) are noted cleanly
    const optionalLabels = screen.getAllByText(/\(optional\)/i);
    expect(optionalLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("blocks submission and displays field errors when required fields are missing", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        categories={mockCategories}
      />,
    );

    // Clear candidate name
    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: "" } });

    // Click submit
    const submitBtn = screen.getByRole("button", { name: /Register Contestant/i });
    fireEvent.click(submitBtn);

    // Should NOT call submit
    expect(handleSubmit).not.toHaveBeenCalled();

    // Should display validation error for name and photos
    expect(screen.getByText(/Candidate full name is required/i)).toBeDefined();
    expect(screen.getByText(/Please upload at least one 4:5 portrait photo/i)).toBeDefined();
  });

  it("passes responsive web design (RWD) structural checks for mobile and desktop viewports", () => {
    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
        divisions={mockCustomDivisions}
      />,
    );

    // 1. Dialog overlay has responsive padding and height constraints (rendered via portal into document.body)
    const dialog = document.body.querySelector("dialog");
    expect(dialog?.className).toContain("p-2.5");
    expect(dialog?.className).toContain("sm:p-6");

    const modalBox = dialog?.querySelector("div.relative");
    expect(modalBox?.className).toContain("max-h-[96vh]");
    expect(modalBox?.className).toContain("sm:max-h-[92vh]");

    // 2. Tablist supports horizontal overflow scrolling without breaking layout
    const tablist = screen.getByRole("tablist");
    expect(tablist.className).toContain("overflow-x-auto");
    expect(tablist.className).toContain("px-3");
    expect(tablist.className).toContain("sm:px-6");

    const coreTab = screen.getByRole("tab", { name: /01\. Core Profile/i });
    expect(coreTab.className).toContain("whitespace-nowrap");
    expect(coreTab.className).toContain("shrink-0");

    // 3. Sticky footer stacks or compacts on mobile viewports
    const footer = document.body.querySelector(".border-t.bg-slate-50\\/90");
    expect(footer?.className).toContain("flex-col");
    expect(footer?.className).toContain("sm:flex-row");
    expect(footer?.className).toContain("px-4");
    expect(footer?.className).toContain("sm:px-6");

    // 4. Candidate photos gallery grid has responsive column scaling (2 cols on mobile, 4-5 on desktop)
    const galleryGrid = document.body.querySelector(".grid.grid-cols-2");
    expect(galleryGrid?.className).toContain("grid-cols-2");
    expect(galleryGrid?.className).toContain("sm:grid-cols-4");
    expect(galleryGrid?.className).toContain("md:grid-cols-5");
  });
});
