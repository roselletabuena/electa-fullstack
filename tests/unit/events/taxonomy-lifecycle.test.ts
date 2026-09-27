import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  PATCH as updateDivision,
  DELETE as deleteDivision,
} from "@/app/api/events/[slug]/divisions/[divisionId]/route";
import {
  PATCH as updateCategory,
  DELETE as deleteCategory,
} from "@/app/api/events/[slug]/award-categories/[categoryId]/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import type { Event, Division, AwardCategory } from "@/generated/client/client";

vi.mock("@/lib/db", () => ({
  db: {
    division: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    awardCategory: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/features/events/utils/ownership-guard", () => ({
  requireEventOwnership: vi.fn(),
}));

describe("Division Lifecycle (PATCH & DELETE)", () => {
  const mockBaseEvent: Event = {
    id: "evt-123",
    slug: "my-event",
    title: "My Event",
    description: "Description",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: new Date("2026-10-01"),
    endsAt: new Date("2026-10-02"),
    publicationStatus: "PUBLISHED",
    draftPassphraseHash: null,
    showResultsOnClose: true,
    isFreeVotingEnabled: true,
    dailyFreeVoteLimit: 1,
    organizerId: "org-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates division successfully", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: mockBaseEvent,
      session: { userId: "org-1", email: "org@example.com", role: "ORGANIZER" },
    });

    vi.mocked(db.division.findUnique).mockResolvedValue({
      id: "div-1",
      eventId: "evt-123",
      name: "Old Name",
      description: null,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(db.division.findFirst).mockResolvedValue(null);
    vi.mocked(db.division.update).mockResolvedValue({
      id: "div-1",
      eventId: "evt-123",
      name: "New Name",
      description: "Updated desc",
      displayOrder: 5,
      createdAt: new Date("2026-09-27T10:00:00Z"),
      updatedAt: new Date("2026-09-27T11:00:00Z"),
    });

    const req = new NextRequest("http://localhost/api/events/my-event/divisions/div-1", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name", displayOrder: 5 }),
    });

    const res = await updateDivision(req, {
      params: Promise.resolve({ slug: "my-event", divisionId: "div-1" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("New Name");
  });

  it("prevents deletion of division with assigned contestants (409)", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: mockBaseEvent,
      session: { userId: "org-1", email: "org@example.com", role: "ORGANIZER" },
    });

    vi.mocked(db.division.findUnique).mockResolvedValue({
      id: "div-1",
      eventId: "evt-123",
      name: "Adult",
      description: null,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { contestants: 3 },
    } as unknown as Division & { _count: { contestants: number } });

    const req = new NextRequest("http://localhost/api/events/my-event/divisions/div-1", {
      method: "DELETE",
    });

    const res = await deleteDivision(req, {
      params: Promise.resolve({ slug: "my-event", divisionId: "div-1" }),
    });
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.success).toBe(false);
    expect(json.error).toContain("Cannot delete division with registered contestants");
  });

  it("deletes unassigned division successfully", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: mockBaseEvent,
      session: { userId: "org-1", email: "org@example.com", role: "ORGANIZER" },
    });

    vi.mocked(db.division.findUnique).mockResolvedValue({
      id: "div-1",
      eventId: "evt-123",
      name: "Adult",
      description: null,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { contestants: 0 },
    } as unknown as Division & { _count: { contestants: number } });

    vi.mocked(db.division.delete).mockResolvedValue({
      id: "div-1",
      eventId: "evt-123",
      name: "Adult",
      description: null,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest("http://localhost/api/events/my-event/divisions/div-1", {
      method: "DELETE",
    });

    const res = await deleteDivision(req, {
      params: Promise.resolve({ slug: "my-event", divisionId: "div-1" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.deleted).toBe(true);
  });
});

describe("Award Category Lifecycle (PATCH & DELETE)", () => {
  const mockBaseEvent: Event = {
    id: "evt-123",
    slug: "my-event",
    title: "My Event",
    description: "Description",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: new Date("2026-10-01"),
    endsAt: new Date("2026-10-02"),
    publicationStatus: "PUBLISHED",
    draftPassphraseHash: null,
    showResultsOnClose: true,
    isFreeVotingEnabled: true,
    dailyFreeVoteLimit: 1,
    organizerId: "org-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates award category voting status", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: mockBaseEvent,
      session: { userId: "org-1", email: "org@example.com", role: "ORGANIZER" },
    });

    vi.mocked(db.awardCategory.findUnique).mockResolvedValue({
      id: "cat-1",
      eventId: "evt-123",
      name: "Best Gown",
      description: null,
      isVotingOpen: true,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(db.awardCategory.update).mockResolvedValue({
      id: "cat-1",
      eventId: "evt-123",
      name: "Best Gown",
      description: null,
      isVotingOpen: false,
      displayOrder: 2,
      createdAt: new Date("2026-09-27T10:00:00Z"),
      updatedAt: new Date("2026-09-27T11:00:00Z"),
    });

    const req = new NextRequest("http://localhost/api/events/my-event/award-categories/cat-1", {
      method: "PATCH",
      body: JSON.stringify({ isVotingOpen: false }),
    });

    const res = await updateCategory(req, {
      params: Promise.resolve({ slug: "my-event", categoryId: "cat-1" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.isVotingOpen).toBe(false);
  });

  it("prevents deletion of award category assigned to contestants (409)", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: mockBaseEvent,
      session: { userId: "org-1", email: "org@example.com", role: "ORGANIZER" },
    });

    vi.mocked(db.awardCategory.findUnique).mockResolvedValue({
      id: "cat-1",
      eventId: "evt-123",
      name: "Best Gown",
      description: null,
      isVotingOpen: true,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { contestants: 5 },
    } as unknown as AwardCategory & { _count: { contestants: number } });

    const req = new NextRequest("http://localhost/api/events/my-event/award-categories/cat-1", {
      method: "DELETE",
    });

    const res = await deleteCategory(req, {
      params: Promise.resolve({ slug: "my-event", categoryId: "cat-1" }),
    });
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.success).toBe(false);
    expect(json.error).toContain("Cannot delete award category assigned to contestants");
  });
});
