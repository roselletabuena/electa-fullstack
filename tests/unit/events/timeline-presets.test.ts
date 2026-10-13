import { describe, it, expect } from "vitest";
import {
  TIMELINE_PRESETS,
  formatLocalDateTime,
  calculateEndsAtFromDuration,
  getActivePreset,
  isTemporalWindowValid,
} from "@/features/events/utils/timeline-presets";

describe("timeline-presets utility", () => {
  it("exposes the three canonical duration presets", () => {
    expect(TIMELINE_PRESETS).toHaveLength(3);
    expect(TIMELINE_PRESETS.map((p) => p.label)).toEqual(["+7 Days", "+14 Days", "+30 Days"]);
    expect(TIMELINE_PRESETS.map((p) => p.days)).toEqual([7, 14, 30]);
  });

  it("formatLocalDateTime formats dates into valid YYYY-MM-DDTHH:mm local ISO strings", () => {
    const testDate = new Date(2026, 9, 15, 14, 30); // 2026-10-15 14:30
    expect(formatLocalDateTime(testDate)).toBe("2026-10-15T14:30");
  });

  it("calculateEndsAtFromDuration adds exact days to startsAt string", () => {
    const startsAt = "2026-10-01T10:00";

    const plus7 = calculateEndsAtFromDuration(startsAt, 7);
    expect(plus7).toBe("2026-10-08T10:00");

    const plus14 = calculateEndsAtFromDuration(startsAt, 14);
    expect(plus14).toBe("2026-10-15T10:00");

    const plus30 = calculateEndsAtFromDuration(startsAt, 30);
    expect(plus30).toBe("2026-10-31T10:00");
  });

  it("getActivePreset identifies matching preset or returns null", () => {
    const startsAt = "2026-10-01T10:00";

    expect(getActivePreset(startsAt, "2026-10-08T10:00")).toBe("7d");
    expect(getActivePreset(startsAt, "2026-10-15T10:00")).toBe("14d");
    expect(getActivePreset(startsAt, "2026-10-31T10:00")).toBe("30d");

    // Non-matching custom duration
    expect(getActivePreset(startsAt, "2026-10-05T10:00")).toBeNull();
    // Non-matching time
    expect(getActivePreset(startsAt, "2026-10-08T11:00")).toBeNull();
    // Invalid strings
    expect(getActivePreset("", "")).toBeNull();
  });

  describe("isTemporalWindowValid", () => {
    it("returns true when endsAt is at least 1 hour after startsAt", () => {
      expect(isTemporalWindowValid("2026-10-01T10:00", "2026-10-01T11:00")).toBe(true);
      expect(isTemporalWindowValid("2026-10-01T10:00", "2026-10-01T12:00")).toBe(true);
      expect(isTemporalWindowValid("2026-10-01T10:00", "2026-10-08T10:00")).toBe(true);
    });

    it("returns false when endsAt is less than 1 hour after startsAt or before startsAt", () => {
      expect(isTemporalWindowValid("2026-10-01T10:00", "2026-10-01T10:30")).toBe(false);
      expect(isTemporalWindowValid("2026-10-01T10:00", "2026-10-01T10:59")).toBe(false);
      expect(isTemporalWindowValid("2026-10-01T10:00", "2026-10-01T10:00")).toBe(false);
      expect(isTemporalWindowValid("2026-10-01T10:00", "2026-10-01T09:00")).toBe(false);
    });

    it("returns false when either date string is invalid", () => {
      expect(isTemporalWindowValid("", "2026-10-01T11:00")).toBe(false);
      expect(isTemporalWindowValid("invalid", "2026-10-01T11:00")).toBe(false);
    });
  });
});
