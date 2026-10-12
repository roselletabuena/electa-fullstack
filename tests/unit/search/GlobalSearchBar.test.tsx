import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { GlobalSearchBar } from "@/features/search/components/GlobalSearchBar";

describe("GlobalSearchBar component", () => {
  it("renders with role=search and accessible aria-label", () => {
    render(
      <NuqsTestingAdapter>
        <GlobalSearchBar ariaLabel="Global event and candidate search" />
      </NuqsTestingAdapter>,
    );

    const form = screen.getByRole("search", { name: /global event and candidate search/i });
    expect(form).toBeDefined();

    const button = screen.getByRole("button", { name: /submit search query/i });
    expect(button).toBeDefined();
    expect(button.textContent).toBe("SEARCH");
    expect(button.className).toContain("rounded-none");
  });

  it("submits query when search button is clicked", async () => {
    const handleSearch = vi.fn();
    render(
      <NuqsTestingAdapter searchParams={{ q: "Luzon" }}>
        <GlobalSearchBar onSearch={handleSearch} />
      </NuqsTestingAdapter>,
    );

    const submitBtn = screen.getByRole("button", { name: /submit search query/i });
    fireEvent.click(submitBtn);

    expect(handleSearch).toHaveBeenCalledWith("Luzon");
  });

  it("clears query when clear button is clicked", async () => {
    const handleClear = vi.fn();
    render(
      <NuqsTestingAdapter searchParams={{ q: "Northern" }}>
        <GlobalSearchBar onClear={handleClear} />
      </NuqsTestingAdapter>,
    );

    const clearBtn = screen.getByRole("button", { name: /clear search input/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });
});
