import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import NewEventPage from "@/app/(dashboard)/events/new/page";

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/features/events/components/CreateEventForm", () => ({
  CreateEventForm: () => <div data-testid="create-event-form">Create Event Form</div>,
}));

describe("NewEventPage (/events/new)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated visitors to login with return path", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    await NewEventPage();

    expect(redirect).toHaveBeenCalledWith("/login?redirect=%2Fevents%2Fnew");
  });

  it("renders creation page container and form when user is authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "org_123",
      email: "org@example.com",
    });

    const jsx = await NewEventPage();
    expect(jsx).toBeDefined();
    expect(redirect).not.toHaveBeenCalled();
  });
});
