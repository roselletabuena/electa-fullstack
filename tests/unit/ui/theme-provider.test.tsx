import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { ThemeProvider, useTheme } from "@/components/shared/theme-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";

function ConsumerComponent() {
  const { theme, toggleTheme, mounted } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <span data-testid="mounted-value">{String(mounted)}</span>
      <button type="button" onClick={toggleTheme} data-testid="toggle-btn">
        Toggle
      </button>
    </div>
  );
}

describe("ThemeProvider and ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    vi.restoreAllMocks();
  });

  it("initializes deterministically with defaultTheme and mounts", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ConsumerComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-value").textContent).toBe("light");
    expect(screen.getByTestId("mounted-value").textContent).toBe("true");
  });

  it("synchronizes stored theme from electa-theme in localStorage on mount", () => {
    localStorage.setItem("electa-theme", "dark");

    render(
      <ThemeProvider defaultTheme="light">
        <ConsumerComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("synchronizes stored theme from legacy votesphere-theme in localStorage on mount", () => {
    localStorage.setItem("votesphere-theme", "dark");

    render(
      <ThemeProvider defaultTheme="light">
        <ConsumerComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles theme between light and dark when toggleTheme is triggered", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ConsumerComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-value").textContent).toBe("light");

    act(() => {
      fireEvent.click(screen.getByTestId("toggle-btn"));
    });

    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
    expect(localStorage.getItem("electa-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => {
      fireEvent.click(screen.getByTestId("toggle-btn"));
    });

    expect(screen.getByTestId("theme-value").textContent).toBe("light");
    expect(localStorage.getItem("electa-theme")).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("renders ThemeToggle with ghost variant and updates accessible label on toggle", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle variant="ghost" />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: /switch to dark mode/i });
    expect(button).toBeDefined();

    act(() => {
      fireEvent.click(button);
    });

    expect(screen.getByRole("button", { name: /switch to light mode/i })).toBeDefined();
  });

  it("renders ThemeToggle with icon variant", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle variant="icon" />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: /switch to dark mode/i });
    expect(button).toBeDefined();
    expect(button.className).toContain("rounded-none");
  });

  it("renders ThemeToggle with pill variant and label", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle variant="pill" showLabel={true} />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: /switch to dark mode/i });
    expect(button).toBeDefined();
    expect(screen.getByText("Dark Mode")).toBeDefined();
  });

  it("renders ThemeToggle safely outside ThemeProvider without crashing", () => {
    render(<ThemeToggle variant="ghost" />);

    const button = screen.getByRole("button", { name: /switch to dark mode/i });
    expect(button).toBeDefined();
  });
});
