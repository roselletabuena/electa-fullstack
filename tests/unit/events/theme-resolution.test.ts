import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  THEME_REGISTRY,
  resolveEventTheme,
  themeTokensToCssVars,
  isKnownTheme,
} from "@/features/events/theme/theme-registry";

describe("Theme Registry & Resolution Engine", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe("THEME_REGISTRY", () => {
    it("contains ELECTA_DEFAULT and PAGEANT_EDITORIAL definitions", () => {
      expect(THEME_REGISTRY.ELECTA_DEFAULT).toBeDefined();
      expect(THEME_REGISTRY.PAGEANT_EDITORIAL).toBeDefined();
      expect(THEME_REGISTRY.ELECTA_DEFAULT.id).toBe("ELECTA_DEFAULT");
      expect(THEME_REGISTRY.PAGEANT_EDITORIAL.id).toBe("PAGEANT_EDITORIAL");
    });

    it("enforces zero-radius and Opal light tokens on ELECTA_DEFAULT", () => {
      const defaultTokens = THEME_REGISTRY.ELECTA_DEFAULT.tokens;
      expect(defaultTokens.radiusSm).toBe("0px");
      expect(defaultTokens.radiusMd).toBe("0px");
      expect(defaultTokens.radiusLg).toBe("0px");
      expect(defaultTokens.radiusPill).toBe("0px");
      expect(defaultTokens.bgBase).toBe("#F8FAFC");
      expect(defaultTokens.textPrimary).toBe("#0F172A");
      expect(defaultTokens.accentPrimary).toBe("#0284C7");
    });

    it("defines luxury editorial tokens on PAGEANT_EDITORIAL", () => {
      const pageantTokens = THEME_REGISTRY.PAGEANT_EDITORIAL.tokens;
      expect(pageantTokens.bgBase).toBe("#0B0C10");
      expect(pageantTokens.bgSurface).toBe("#12141C");
      expect(pageantTokens.accentPrimary).toBe("#CBB279");
      expect(pageantTokens.fontSerif).toContain("Cormorant Garamond");
    });
  });

  describe("isKnownTheme", () => {
    it("returns true for valid theme enum strings", () => {
      expect(isKnownTheme("ELECTA_DEFAULT")).toBe(true);
      expect(isKnownTheme("PAGEANT_EDITORIAL")).toBe(true);
    });

    it("returns false for invalid theme strings or non-strings", () => {
      expect(isKnownTheme("INVALID_THEME")).toBe(false);
      expect(isKnownTheme("")).toBe(false);
      expect(isKnownTheme(null)).toBe(false);
      expect(isKnownTheme(undefined)).toBe(false);
      expect(isKnownTheme(123)).toBe(false);
    });
  });

  describe("resolveEventTheme", () => {
    it("resolves ELECTA_DEFAULT accurately", () => {
      const theme = resolveEventTheme("ELECTA_DEFAULT");
      expect(theme.id).toBe("ELECTA_DEFAULT");
      expect(theme.slug).toBe("electa-default");
      expect(theme.tokens.accentPrimary).toBe("#0284C7");
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("resolves PAGEANT_EDITORIAL accurately", () => {
      const theme = resolveEventTheme("PAGEANT_EDITORIAL");
      expect(theme.id).toBe("PAGEANT_EDITORIAL");
      expect(theme.slug).toBe("pageant-editorial");
      expect(theme.tokens.accentPrimary).toBe("#CBB279");
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("safely falls back to ELECTA_DEFAULT when theme is null or undefined without warning", () => {
      const nullTheme = resolveEventTheme(null);
      expect(nullTheme.id).toBe("ELECTA_DEFAULT");
      expect(warnSpy).not.toHaveBeenCalled();

      const undefinedTheme = resolveEventTheme(undefined);
      expect(undefinedTheme.id).toBe("ELECTA_DEFAULT");
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("gracefully falls back to ELECTA_DEFAULT and logs a warning for unknown theme string", () => {
      const fallbackTheme = resolveEventTheme("CYBERPUNK_NEON");
      expect(fallbackTheme.id).toBe("ELECTA_DEFAULT");
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ThemeEngine] Unknown or deprecated theme "CYBERPUNK_NEON"'),
      );
    });
  });

  describe("themeTokensToCssVars", () => {
    it("transforms ThemeTokens into CSS custom properties dictionary", () => {
      const cssVars = themeTokensToCssVars(THEME_REGISTRY.ELECTA_DEFAULT.tokens);
      expect(cssVars["--bg-base"]).toBe("#F8FAFC");
      expect(cssVars["--text-primary"]).toBe("#0F172A");
      expect(cssVars["--accent-primary"]).toBe("#0284C7");
      expect(cssVars["--radius-sm"]).toBe("0px");
    });
  });
});
