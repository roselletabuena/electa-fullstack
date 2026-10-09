import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Progress } from "@/components/ui/progress";

describe("Progress component", () => {
  it("renders a semantic <progress> element with default attributes", () => {
    render(<Progress value={40} data-testid="progress-element" />);
    const progressEl = screen.getByTestId("progress-element");

    expect(progressEl.tagName.toLowerCase()).toBe("progress");
    expect(progressEl).toHaveAttribute("value", "40");
    expect(progressEl).toHaveAttribute("max", "100");
    expect(progressEl).toHaveTextContent("40%");
  });

  it("calculates percentage and clamps bounds properly", () => {
    const { rerender } = render(<Progress value={150} max={100} data-testid="progress-element" />);
    let progressEl = screen.getByTestId("progress-element");
    expect(progressEl).toHaveAttribute("value", "100");
    expect(progressEl).toHaveTextContent("100%");

    rerender(<Progress value={-20} max={100} data-testid="progress-element" />);
    progressEl = screen.getByTestId("progress-element");
    expect(progressEl).toHaveAttribute("value", "0");
    expect(progressEl).toHaveTextContent("0%");
  });

  it("supports custom max and calculates percentage correctly", () => {
    render(<Progress value={25} max={50} data-testid="progress-element" />);
    const progressEl = screen.getByTestId("progress-element");

    expect(progressEl).toHaveAttribute("value", "25");
    expect(progressEl).toHaveAttribute("max", "50");
    expect(progressEl).toHaveTextContent("50%");
  });

  it("forwards ref to the native HTMLProgressElement", () => {
    const ref = createRef<HTMLProgressElement>();
    render(<Progress ref={ref} value={60} />);

    expect(ref.current).toBeInstanceOf(HTMLProgressElement);
    expect(ref.current?.value).toBe(60);
  });

  it("applies custom className and indicatorClassName", () => {
    render(
      <Progress
        value={75}
        className="custom-class"
        indicatorClassName="custom-indicator"
        data-testid="progress-element"
      />,
    );
    const progressEl = screen.getByTestId("progress-element");
    expect(progressEl.className).toContain("custom-class");
    expect(progressEl.className).toContain("custom-indicator");
  });
});
