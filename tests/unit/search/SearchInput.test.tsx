import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "@/features/search/components/SearchInput";

describe("SearchInput component", () => {
  it("renders with placeholder and value", () => {
    render(<SearchInput value="Miss Luzon" onChange={vi.fn()} placeholder="Search pageants..." />);

    const input = screen.getByPlaceholderText("Search pageants...");
    expect(input).toBeDefined();
    expect(input.getAttribute("value")).toBe("Miss Luzon");
    expect(input.className).toContain("rounded-none");
  });

  it("calls onChange when typing", () => {
    const handleChange = vi.fn();
    render(<SearchInput value="" onChange={handleChange} placeholder="Search..." />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Queen" } });
    expect(handleChange).toHaveBeenCalledWith("Queen");
  });

  it("renders clear button when value is non-empty", () => {
    const handleClear = vi.fn();
    render(<SearchInput value="Maria" onChange={vi.fn()} onClear={handleClear} />);

    const clearBtn = screen.getByRole("button", { name: /clear search input/i });
    expect(clearBtn).toBeDefined();

    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it("does not render clear button when value is empty", () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /clear search input/i })).toBeNull();
  });

  it("calls onClear when Escape key is pressed", () => {
    const handleClear = vi.fn();
    render(<SearchInput value="Test" onChange={vi.fn()} onClear={handleClear} />);

    const input = screen.getByDisplayValue("Test");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit when Enter key is pressed", () => {
    const handleSubmit = vi.fn();
    render(<SearchInput value="Test" onChange={vi.fn()} onSubmit={handleSubmit} />);

    const input = screen.getByDisplayValue("Test");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
