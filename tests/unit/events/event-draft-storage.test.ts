import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  EVENT_CREATE_DRAFT_KEY,
  saveDraftToSession,
  loadDraftFromSession,
  clearDraftFromSession,
  hasDraftContent,
  type CreateEventDraftData,
} from "@/features/events/utils/event-draft-storage";

describe("event-draft-storage utility", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  const mockDraft: CreateEventDraftData = {
    title: "Miss Aurora 2026",
    slug: "miss-aurora-2026",
    description: "Annual beauty and talent pageant in Baler, Aurora.",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: "2026-11-01T10:00",
    endsAt: "2026-11-15T10:00",
    isCustomSlug: true,
  };

  it("saves draft data to sessionStorage with timestamp", () => {
    saveDraftToSession(mockDraft);

    const storedRaw = sessionStorage.getItem(EVENT_CREATE_DRAFT_KEY);
    expect(storedRaw).toBeTruthy();

    const parsed = JSON.parse(storedRaw as string);
    expect(parsed.title).toBe("Miss Aurora 2026");
    expect(parsed.slug).toBe("miss-aurora-2026");
    expect(parsed.savedAt).toBeTypeOf("number");
  });

  it("loads draft data correctly from sessionStorage", () => {
    saveDraftToSession(mockDraft);

    const loaded = loadDraftFromSession();
    expect(loaded).toEqual(mockDraft);
  });

  it("returns null when loading from empty sessionStorage or corrupt JSON", () => {
    expect(loadDraftFromSession()).toBeNull();

    sessionStorage.setItem(EVENT_CREATE_DRAFT_KEY, "invalid-json{");
    expect(loadDraftFromSession()).toBeNull();
  });

  it("clears draft data from sessionStorage", () => {
    saveDraftToSession(mockDraft);
    expect(sessionStorage.getItem(EVENT_CREATE_DRAFT_KEY)).toBeTruthy();

    clearDraftFromSession();
    expect(sessionStorage.getItem(EVENT_CREATE_DRAFT_KEY)).toBeNull();
    expect(loadDraftFromSession()).toBeNull();
  });

  describe("hasDraftContent", () => {
    it("returns true when any meaningful field has non-empty content", () => {
      expect(hasDraftContent(mockDraft)).toBe(true);
      expect(hasDraftContent({ ...mockDraft, title: "Title Only", description: "", slug: "", bannerUrl: "" })).toBe(true);
      expect(hasDraftContent({ ...mockDraft, title: "", description: "Desc Only", slug: "", bannerUrl: "" })).toBe(true);
    });

    it("returns false when draft is null or fields are empty strings", () => {
      expect(hasDraftContent(null)).toBe(false);
      expect(
        hasDraftContent({
          title: "   ",
          slug: "",
          description: " ",
          bannerUrl: "",
          startsAt: "2026-10-01T10:00",
          endsAt: "2026-10-08T10:00",
        }),
      ).toBe(false);
    });
  });

  it("gracefully handles storage quota errors or inaccessible sessionStorage", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    // Should not throw
    expect(() => saveDraftToSession(mockDraft)).not.toThrow();
    setItemSpy.mockRestore();
  });
});
