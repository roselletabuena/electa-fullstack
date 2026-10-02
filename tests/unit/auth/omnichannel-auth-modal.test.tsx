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

vi.mock("@/features/auth/actions/passwordless-actions", () => ({
  requestPasswordlessOtpAction: vi.fn().mockResolvedValue({ success: true, message: "Code sent!" }),
  verifyPasswordlessOtpAction: vi.fn().mockResolvedValue({ success: true, user: { id: "user-1" } }),
}));

describe("OmnichannelAuthModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<OmnichannelAuthModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with custom title and providers when open", () => {
    render(
      <OmnichannelAuthModal isOpen={true} onClose={vi.fn()} title="Sign In to Cast Your Vote" />,
    );

    expect(screen.getByText("Sign In to Cast Your Vote")).toBeDefined();
    expect(screen.getByText("Continue with Google")).toBeDefined();
    expect(screen.getByText("Continue with Apple")).toBeDefined();
    expect(screen.getByText("Continue with Facebook")).toBeDefined();
    expect(screen.getByText("Email Magic Link / Code")).toBeDefined();
    expect(screen.getByText("Phone OTP (SMS / WhatsApp)")).toBeDefined();
  });

  it("saves vote intent and routes to OAuth endpoint on Google click", () => {
    const saveIntentSpy = vi.spyOn(voteIntentModule, "savePendingVoteIntent");
    const voteIntent = {
      eventId: "evt-123",
      contestantId: "cnt-456",
      contestantName: "Maria Santos",
    };

    render(<OmnichannelAuthModal isOpen={true} onClose={vi.fn()} voteIntent={voteIntent} />);

    const googleBtn = screen.getByText("Continue with Google");
    fireEvent.click(googleBtn);

    expect(saveIntentSpy).toHaveBeenCalledWith(voteIntent);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/cognito/initiate?provider=Google"),
    );
  });

  it("switches to email mode and phone mode correctly", () => {
    render(<OmnichannelAuthModal isOpen={true} onClose={vi.fn()} />);

    const emailBtn = screen.getByText("Email Magic Link / Code");
    fireEvent.click(emailBtn);
    expect(screen.getByPlaceholderText("voter@example.com")).toBeDefined();

    const backBtn = screen.getByText("← Back to all options");
    fireEvent.click(backBtn);
    expect(screen.getByText("Continue with Google")).toBeDefined();
  });
});
