// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/events/route";
import { createEvent } from "@/features/events/services/create-event";

vi.mock("@/features/events/services/create-event", () => ({
  createEvent: vi.fn(),
}));

describe("POST /api/events Archetype Boundary Guardrail (VS-117)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    title: "Miss Universe Philippines 2026",
    slug: "muph-2026",
    description: "Annual nationwide beauty pageant competition for candidate selection.",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: "2026-10-01T00:00:00.000Z",
    endsAt: "2026-10-01T02:00:00.000Z",
  };

  it("Scenario 3: rejects direct API call with disabled archetypes (STUDENT_COUNCIL, HACKATHON, CUSTOM) with 400 Bad Request", async () => {
    const disabledArchetypes = ["STUDENT_COUNCIL", "HACKATHON", "CUSTOM"] as const;

    for (const archetype of disabledArchetypes) {
      const req = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validPayload,
          title: `${archetype} Competition`,
          slug: `${archetype.toLowerCase()}-2026`,
          archetype,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("This event archetype is coming soon and currently disabled.");
      expect(createEvent).not.toHaveBeenCalled();
    }
  });

  it("Scenario 1: allows valid pageant event creation through POST /api/events", async () => {
    vi.mocked(createEvent).mockResolvedValue({
      success: true,
      data: {
        id: "evt_pageant_123",
        slug: "muph-2026",
        title: "Miss Universe Philippines 2026",
        archetype: "PAGEANT",
      } as unknown as import("@/generated/client/client").Event,
    });

    const req = new NextRequest("http://localhost:3000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validPayload,
        archetype: "PAGEANT",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "muph-2026",
        archetype: "PAGEANT",
      })
    );
  });
});
