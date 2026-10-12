import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SiteShell } from "@/features/navigation/components/site-shell";

function renderShell() {
  return render(
    <ThemeProvider defaultTheme="light">
      <SiteShell>
        <p>Page body</p>
      </SiteShell>
    </ThemeProvider>,
  );
}

describe("SiteShell (VS-100 / VS-101)", () => {
  it("renders the persistent header, page content, and footer", () => {
    renderShell();

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create a new event" })).toHaveAttribute(
      "href",
      "/events/new",
    );
    expect(screen.getByRole("link", { name: "Sign in to your account" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByText("Page body")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByText("© 2026 Electa Platform. All Rights Reserved.")).toBeInTheDocument();
  });

  it("orders header, content, footer and pins footer via flex column layout", () => {
    const { container } = renderShell();
    const root = container.firstElementChild as HTMLElement;

    expect(root.className).toContain("min-h-screen");
    expect(root.className).toContain("flex-col");

    const children = Array.from(root.children).map((el) => el.tagName);
    expect(children).toEqual(["HEADER", "DIV", "FOOTER"]);
    expect((root.children[1] as HTMLElement).className).toContain("flex-1");
  });

  it("uses zero-radius geometry on shell chrome", () => {
    const { container } = renderShell();
    const html = container.innerHTML;

    expect(html).not.toMatch(/rounded-(md|lg|xl|2xl|full)/);
  });
});
