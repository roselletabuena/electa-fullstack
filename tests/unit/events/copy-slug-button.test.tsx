import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { CopySlugButton } from "@/features/events/components/dashboard/CopySlugButton";

describe("CopySlugButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default label and copies URL to clipboard", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
      writable: true,
    });

    render(<CopySlugButton slug="miss-visayas-2026" />);

    const button = screen.getByRole("button", { name: /copy public link/i });
    expect(button).toBeDefined();

    fireEvent.click(button);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining("/events/miss-visayas-2026"),
      );
    });

    expect(screen.getByText("Copied!")).toBeDefined();
  });

  it("handles fallback when clipboard API is unavailable", async () => {
    // Override navigator.clipboard to be undefined
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });

    const execCommandMock = vi.fn();
    document.execCommand = execCommandMock;

    render(<CopySlugButton slug="miss-visayas-2026" />);

    const button = screen.getByRole("button", { name: /copy public link/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(execCommandMock).toHaveBeenCalledWith("copy");
    });
  });
});
