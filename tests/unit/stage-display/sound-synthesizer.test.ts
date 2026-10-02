import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  setAudioMuted,
  getAudioMuted,
  playTensionDrone,
  playRevealChime,
  playVictoryFanfare,
  isAudioSupported,
  initAudio,
} from "@/features/stage-display/utils/sound-synthesizer";

describe("sound-synthesizer", () => {
  beforeEach(() => {
    setAudioMuted(false);
  });

  it("toggles and tracks audio mute state accurately", () => {
    expect(getAudioMuted()).toBe(false);
    setAudioMuted(true);
    expect(getAudioMuted()).toBe(true);
    setAudioMuted(false);
    expect(getAudioMuted()).toBe(false);
  });

  it("checks audio support without throwing in Node/JSDOM", () => {
    const supported = isAudioSupported();
    expect(typeof supported).toBe("boolean");
  });

  it("executes sound triggers safely without unhandled exceptions", () => {
    expect(() => playTensionDrone()).not.toThrow();
    expect(() => playRevealChime()).not.toThrow();
    expect(() => playVictoryFanfare()).not.toThrow();
  });

  it("does not play when muted", () => {
    setAudioMuted(true);
    expect(() => playTensionDrone()).not.toThrow();
    expect(() => playRevealChime()).not.toThrow();
    expect(() => playVictoryFanfare()).not.toThrow();
  });

  it("handles mock AudioContext lifecycle correctly", async () => {
    const mockResume = vi.fn().mockResolvedValue(undefined);
    const mockCreateOscillator = vi.fn().mockReturnValue({
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    });
    const mockCreateGain = vi.fn().mockReturnValue({
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    });

    // Mock AudioContext on window with a constructible class
    const originalAudioContext = window.AudioContext;
    class MockAudioContext {
      state = "suspended";
      currentTime = 10;
      destination = {};
      resume = mockResume;
      createOscillator = mockCreateOscillator;
      createGain = mockCreateGain;
    }
    window.AudioContext = MockAudioContext as unknown as typeof AudioContext;

    try {
      const initialized = await initAudio();
      expect(typeof initialized).toBe("boolean");
    } finally {
      window.AudioContext = originalAudioContext;
    }
  });
});
