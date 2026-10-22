import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventThemeProvider, useEventTheme } from "@/features/events/theme/EventThemeProvider";

function TestConsumer() {
  const { theme, themeSlug, tokens } = useEventTheme();
  return (
    <div>
      <span data-testid="consumer-theme">{theme}</span>
      <span data-testid="consumer-slug">{themeSlug}</span>
      <span data-testid="consumer-accent">{tokens.accentPrimary}</span>
    </div>
  );
}

describe("EventThemeProvider", () => {
  it("renders children and sets data-event-theme='electa-default' for default theme", () => {
    const { container } = render(
      <EventThemeProvider theme="ELECTA_DEFAULT">
        <p>Public Event Content</p>
      </EventThemeProvider>,
    );

    const themeContainer = container.firstElementChild as HTMLElement;
    expect(themeContainer).not.toBeNull();
    expect(themeContainer.getAttribute("data-event-theme")).toBe("electa-default");
    expect(themeContainer.style.getPropertyValue("--bg-base")).toBe("#F8FAFC");
    expect(screen.getByText("Public Event Content")).toBeDefined();
  });

  it("sets data-event-theme='pageant-editorial' and injects pageant CSS vars when theme is PAGEANT_EDITORIAL", () => {
    const { container } = render(
      <EventThemeProvider theme="PAGEANT_EDITORIAL">
        <p>Pageant Ballot</p>
      </EventThemeProvider>,
    );

    const themeContainer = container.firstElementChild as HTMLElement;
    expect(themeContainer.getAttribute("data-event-theme")).toBe("pageant-editorial");
    expect(themeContainer.style.getPropertyValue("--bg-base")).toBe("#0B0C10");
    expect(themeContainer.style.getPropertyValue("--accent-primary")).toBe("#CBB279");
  });

  it("gracefully falls back to electa-default when theme is null or undefined", () => {
    const { container } = render(
      <EventThemeProvider theme={null}>
        <p>Fallback Content</p>
      </EventThemeProvider>,
    );

    const themeContainer = container.firstElementChild as HTMLElement;
    expect(themeContainer.getAttribute("data-event-theme")).toBe("electa-default");
  });

  it("provides theme context to consumers", () => {
    render(
      <EventThemeProvider theme="PAGEANT_EDITORIAL">
        <TestConsumer />
      </EventThemeProvider>,
    );

    expect(screen.getByTestId("consumer-theme").textContent).toBe("PAGEANT_EDITORIAL");
    expect(screen.getByTestId("consumer-slug").textContent).toBe("pageant-editorial");
    expect(screen.getByTestId("consumer-accent").textContent).toBe("#CBB279");
  });
});
