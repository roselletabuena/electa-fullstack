import { describe, it, expect } from "vitest";
import {
  formatCooldownCountdown,
  getRemainingMilliseconds,
} from "@/features/voting/utils/quota-calculator";

describe("formatCooldownCountdown", () => {
  it("formats positive milliseconds to HH:MM:SS", () => {
    const ms = 14 * 3600 * 1000 + 22 * 60 * 1000 + 10 * 1000; // 14:22:10
    expect(formatCooldownCountdown(ms)).toBe("14:22:10");
  });

  it("pads single digit hours, minutes, and seconds with zero", () => {
    const ms = 5 * 3600 * 1000 + 8 * 60 * 1000 + 4 * 1000; // 05:08:04
    expect(formatCooldownCountdown(ms)).toBe("05:08:04");
  });

  it("returns 00:00:00 when duration is 0 or negative", () => {
    expect(formatCooldownCountdown(0)).toBe("00:00:00");
    expect(formatCooldownCountdown(-5000)).toBe("00:00:00");
  });
});

describe("getRemainingMilliseconds", () => {
  const baseNow = new Date("2026-09-28T12:00:00.000Z");

  it("calculates exact milliseconds remaining until nextResetTime", () => {
    const nextReset = "2026-09-28T13:00:00.000Z"; // 1 hour ahead
    expect(getRemainingMilliseconds(nextReset, baseNow)).toBe(3600000);
  });

  it("returns 0 if nextResetTime is in the past", () => {
    const pastReset = "2026-09-28T11:00:00.000Z";
    expect(getRemainingMilliseconds(pastReset, baseNow)).toBe(0);
  });

  it("returns 0 if nextResetTime is null or undefined", () => {
    expect(getRemainingMilliseconds(null, baseNow)).toBe(0);
    expect(getRemainingMilliseconds(undefined, baseNow)).toBe(0);
  });
});
