import { describe, expect, it } from "vitest";

import type { PublicEventDto } from "@/features/events/types";
import { getMockEventBySlug } from "@/features/events/utils/mock-data";

describe("Draft Preview Ownership Gating Logic", () => {
  const mockDraftEvent: PublicEventDto = {
    ...getMockEventBySlug("preview-draft-contest")!,
    organizerId: "org_owner_123",
    operationalState: "Draft",
  };

  function evaluateDraftAccess(
    event: PublicEventDto,
    session: { userId: string } | null,
    hasValidPreviewCookie: boolean,
  ): "organizer" | "guest" | "modal" | "unconfigured" {
    if (event.operationalState !== "Draft") {
      return "guest"; // Public access
    }

    // 1. Strict owner check
    if (session && session.userId === event.organizerId) {
      return "organizer";
    }

    // 2. Guest preview check
    if (hasValidPreviewCookie) {
      return "guest";
    }

    // 3. Fallback to passphrase modal
    return "modal";
  }

  it("grants direct organizer preview to verified event owner", () => {
    const ownerSession = { userId: "org_owner_123" };
    const access = evaluateDraftAccess(mockDraftEvent, ownerSession, false);
    expect(access).toBe("organizer");
  });

  it("challenges authenticated non-owner users with draft passphrase modal", () => {
    const otherUserSession = { userId: "voter_user_456" };
    const access = evaluateDraftAccess(mockDraftEvent, otherUserSession, false);
    expect(access).toBe("modal");
  });

  it("challenges unauthenticated anonymous visitors with draft passphrase modal", () => {
    const access = evaluateDraftAccess(mockDraftEvent, null, false);
    expect(access).toBe("modal");
  });

  it("allows authenticated non-owner to access as guest if presenting valid preview cookie", () => {
    const otherUserSession = { userId: "voter_user_456" };
    const access = evaluateDraftAccess(mockDraftEvent, otherUserSession, true);
    expect(access).toBe("guest");
  });

  it("allows unauthenticated visitor to access as guest if presenting valid preview cookie", () => {
    const access = evaluateDraftAccess(mockDraftEvent, null, true);
    expect(access).toBe("guest");
  });
});
