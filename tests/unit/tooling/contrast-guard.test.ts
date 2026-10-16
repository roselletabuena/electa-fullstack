import { describe, it, expect } from "vitest";
import {
  findContrastViolations,
  shouldCheckFile,
} from "../../../.agents/scripts/check-accessibility-contrast.mjs";

describe("Accessibility Color Contrast Guard (.agents/scripts/check-accessibility-contrast.mjs)", () => {
  it("detects low-contrast gray text on light background", () => {
    const snippet = `
      export function BrokenTitle() {
        return <h1 className="font-heading text-lg text-slate-300">Unreadable Title</h1>;
      }
    `;

    const violations = findContrastViolations(snippet);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe("LOW_CONTRAST_GRAY");
    expect(violations[0]?.token).toBe("text-slate-300");
    expect(violations[0]?.message).toContain("violates WCAG 2.1 AA");
  });

  it("detects naked dark-mode text classes on unthemed/light background", () => {
    const snippet = `
      export function NakedWhiteText() {
        return <p className="font-sans text-sm text-white">Invisible on Opal Slate-50</p>;
      }
    `;

    const violations = findContrastViolations(snippet);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe("NAKED_DARK_TEXT");
    expect(violations[0]?.token).toBe("text-white");
    expect(violations[0]?.recommendation).toContain("text-slate-900 dark:text-white");
  });

  it("allows properly scoped dark-mode variants", () => {
    const snippet = `
      export function CompliantText() {
        return (
          <p className="font-sans text-sm text-slate-700 dark:text-slate-300">
            Perfect contrast in both themes
          </p>
        );
      }
    `;

    const violations = findContrastViolations(snippet);
    expect(violations).toHaveLength(0);
  });

  it("allows text-white inside explicit dark containers", () => {
    const snippet = `
      export function DarkCard() {
        return (
          <div className="bg-slate-900 p-4 text-white">
            <span className="font-mono text-xs text-slate-300">Dark badge</span>
          </div>
        );
      }
    `;

    const violations = findContrastViolations(snippet);
    expect(violations).toHaveLength(0);
  });

  it("allows text-white on primary button classes and color shades", () => {
    const snippet = `
      export function ActionButtons() {
        return (
          <div>
            <button className="btn-primary text-white">Submit</button>
            <div className="bg-sky-600 text-white">Notification</div>
            <div className="bg-red-950/90 text-white">Error Dialog</div>
          </div>
        );
      }
    `;

    const violations = findContrastViolations(snippet);
    expect(violations).toHaveLength(0);
  });

  it("respects // contrast-ignore inline comments", () => {
    const snippet = `
      // contrast-ignore
      const sample = <span className="text-slate-300">Decorative test</span>;
    `;

    const violations = findContrastViolations(snippet);
    expect(violations).toHaveLength(0);
  });

  it("validates shouldCheckFile filters", () => {
    const workspaceRoot = process.cwd();
    expect(shouldCheckFile("src/components/button.tsx", workspaceRoot)).toBe(false); // file doesn't exist yet
    expect(shouldCheckFile("node_modules/foo/index.tsx", workspaceRoot)).toBe(false);
    expect(shouldCheckFile(".agents/scripts/foo.tsx", workspaceRoot)).toBe(false);
    expect(shouldCheckFile("tests/unit/test.tsx", workspaceRoot)).toBe(false);
    expect(shouldCheckFile("src/lib/db.ts", workspaceRoot)).toBe(false); // only .tsx / .jsx
  });
});
