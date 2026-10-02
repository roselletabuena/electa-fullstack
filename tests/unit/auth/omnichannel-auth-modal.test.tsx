import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OmnichannelAuthModal } from "@/features/auth/components/OmnichannelAuthModal";
import * as voteIntentModule from "@/features/voting/utils/vote-intent";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

describe("OmnichannelAuthModal (Google Voter Auth)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<OmnichannelAuthModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with custom title and Google provider when open", () => {
    render(
      <OmnichannelAuthModal isOpen={true} onClose={vi.fn()} title="Sign In to Cast Your Vote" />,
    );

    expect(screen.getByText("Sign In to Cast Your Vote")).toBeDefined();
    expect(screen.getByText("Continue with Google")).toBeDefined();
  });

  it("saves vote intent and routes to OAuth endpoint on Google click", () => {
    const saveIntentSpy = vi.spyOn(voteIntentModule, "savePendingVoteIntent");
    const voteIntent = {
      eventId: "evt-123",
      contestantId: "cnt-456",
      contestantName: "Roselle Tabuena",
    };

    render(<OmnichannelAuthModal isOpen={true} onClose={vi.fn()} voteIntent={voteIntent} />);

    const googleBtn = screen.getByText("Continue with Google");
    fireEvent.click(googleBtn);

    expect(saveIntentSpy).toHaveBeenCalledWith(voteIntent);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/cognito/initiate?provider=Google"),
    );
  });

  it("calls onClose when close button or backdrop is clicked", () => {
    const onCloseSpy = vi.fn();
    render(<OmnichannelAuthModal isOpen={true} onClose={onCloseSpy} />);

    const closeBtn = screen.getByLabelText("Close dialog");
    fireEvent.click(closeBtn);
    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });
});
