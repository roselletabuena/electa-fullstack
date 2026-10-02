import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthPromptModal } from "@/features/voting/components/AuthPromptModal";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("AuthPromptModal", () => {
  it("renders with candidate name in subtitle", () => {
    render(<AuthPromptModal isOpen={true} onClose={vi.fn()} candidateName="Maria Santos" />);

    expect(screen.getByText("Sign In to Cast Your Vote")).toBeDefined();
    expect(
      screen.getByText(
        "Support Maria Santos with your daily free votes by signing in with your preferred account.",
      ),
    ).toBeDefined();
  });
});
