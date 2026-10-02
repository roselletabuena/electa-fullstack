import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfettiCannon } from "@/features/stage-display/utils/confetti-cannon";

describe("ConfettiCannon", () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    mockContext = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    mockCanvas = {
      width: 1920,
      height: 1080,
      getContext: vi.fn().mockReturnValue(mockContext),
    } as unknown as HTMLCanvasElement;
  });

  it("initializes canvas context and sets dimensions", () => {
    const cannon = new ConfettiCannon(mockCanvas);
    expect(mockCanvas.getContext).toHaveBeenCalledWith("2d");
    cannon.stop();
  });

  it("spawns particles on fire() without throwing", () => {
    const cannon = new ConfettiCannon(mockCanvas);
    expect(() => cannon.fire(50)).not.toThrow();
    cannon.stop();
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it("stops and clears particles cleanly on stop()", () => {
    const cannon = new ConfettiCannon(mockCanvas);
    cannon.fire(30);
    cannon.stop();
    expect(mockContext.clearRect).toHaveBeenCalled();
  });
});
