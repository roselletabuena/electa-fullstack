import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/events/[slug]/route";
import { getSession } from "@/lib/auth/get-session";
import { signPreviewToken, computePassphraseDigest } from "@/features/events/utils/preview-token";

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

describe("Draft Event API Authorization (GET /api/events/[slug])", () => {
  const draftSlug = "preview-draft-contest";
  const validMockDigest = computePassphraseDigest("judge-preview-2026");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 Not Found for unauthenticated access to draft event", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const request = new NextRequest(`http://localhost:3000/api/events/${draftSlug}`);
    const response = await GET(request, {
      params: Promise.resolve({ slug: draftSlug }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Event not found");
  });

  it("returns 404 Not Found for authenticated non-owner access to draft event without preview cookie", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "different_user_999",
      email: "voter@example.com",
      name: "Voter",
      role: "VOTER",
    });

    const request = new NextRequest(`http://localhost:3000/api/events/${draftSlug}`);
    const response = await GET(request, {
      params: Promise.resolve({ slug: draftSlug }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it("returns 200 OK for verified event owner accessing draft event", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "usr_org_01",
      email: "organizer@example.com",
      name: "Organizer",
      role: "ORGANIZER",
    });

    const request = new NextRequest(`http://localhost:3000/api/events/${draftSlug}`);
    const response = await GET(request, {
      params: Promise.resolve({ slug: draftSlug }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.slug).toBe(draftSlug);
    expect(body.data.operationalState).toBe("Draft");
  });

  it("returns 200 OK for caller presenting valid preview cookie", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const { token } = signPreviewToken(draftSlug, validMockDigest);

    const request = new NextRequest(`http://localhost:3000/api/events/${draftSlug}`, {
      headers: {
        cookie: `vs_preview_${draftSlug}=${token}`,
      },
    });

    const response = await GET(request, {
      params: Promise.resolve({ slug: draftSlug }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.slug).toBe(draftSlug);
  });

  it("returns 200 OK without draft restrictions for published events", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const publishedSlug = "miss-visayas-2026";
    const request = new NextRequest(`http://localhost:3000/api/events/${publishedSlug}`);
    const response = await GET(request, {
      params: Promise.resolve({ slug: publishedSlug }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.slug).toBe(publishedSlug);
  });
});
