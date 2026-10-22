import type { EventTheme, ThemeDefinition, ThemeTokens } from "../types/theme";
import { EVENT_THEMES } from "../types/theme";

/**
 * Transforms a ThemeTokens object into a CSS custom properties dictionary.
 */
export function themeTokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  const cssVars: Record<string, string> = {
    "--bg-base": tokens.bgBase,
    "--bg-surface": tokens.bgSurface,
    "--bg-surface-elevated": tokens.bgSurfaceElevated,
    "--bg-surface-hover": tokens.bgSurfaceHover,
    "--border-hairline": tokens.borderHairline,
    "--border-accent": tokens.borderAccent,
    "--border-accent-bright": tokens.borderAccentBright,
    "--accent-primary": tokens.accentPrimary,
    "--accent-secondary": tokens.accentSecondary,
    "--accent-muted": tokens.accentMuted,
    "--text-primary": tokens.textPrimary,
    "--text-secondary": tokens.textSecondary,
    "--text-tertiary": tokens.textTertiary,
    "--font-heading": tokens.fontHeading,
    "--font-body": tokens.fontBody,
    "--radius-sm": tokens.radiusSm,
    "--radius-md": tokens.radiusMd,
    "--radius-lg": tokens.radiusLg,
    "--radius-pill": tokens.radiusPill,
  };

  if (tokens.fontSerif) {
    cssVars["--font-serif"] = tokens.fontSerif;
  }

  return cssVars;
}

const electaDefaultTokens: ThemeTokens = {
  bgBase: "#F8FAFC",
  bgSurface: "#FFFFFF",
  bgSurfaceElevated: "#FFFFFF",
  bgSurfaceHover: "#F1F5F9",
  borderHairline: "#CBD5E1",
  borderAccent: "#0284C7",
  borderAccentBright: "#0284C7",
  accentPrimary: "#0284C7",
  accentSecondary: "#0EA5E9",
  accentMuted: "#E0F2FE",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#64748B",
  fontHeading: "var(--font-heading), Outfit, sans-serif",
  fontBody: "var(--font-sans), Sora, sans-serif",
  fontSerif: "Georgia, serif",
  radiusSm: "0px",
  radiusMd: "0px",
  radiusLg: "0px",
  radiusPill: "0px",
};

const pageantEditorialTokens: ThemeTokens = {
  bgBase: "#0B0C10",
  bgSurface: "#12141C",
  bgSurfaceElevated: "#181B26",
  bgSurfaceHover: "#1E2230",
  borderHairline: "rgba(255, 255, 255, 0.08)",
  borderAccent: "rgba(203, 178, 121, 0.35)",
  borderAccentBright: "#CBB279",
  accentPrimary: "#CBB279",
  accentSecondary: "#F4EBD9",
  accentMuted: "#8E7C55",
  textPrimary: "#F9F9FB",
  textSecondary: "#9BA3B4",
  textTertiary: "#5D6577",
  fontHeading: "'Cormorant Garamond', Georgia, serif",
  fontBody: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontSerif: "'Cormorant Garamond', Georgia, serif",
  radiusSm: "4px",
  radiusMd: "8px",
  radiusLg: "14px",
  radiusPill: "9999px",
};

export const THEME_REGISTRY: Record<EventTheme, ThemeDefinition> = {
  ELECTA_DEFAULT: {
    id: "ELECTA_DEFAULT",
    slug: "electa-default",
    displayName: "Electa Opal (Default)",
    description: "Electa's clean Opal slate design system with sharp brutalist-refined zero-radius geometry.",
    tokens: electaDefaultTokens,
    cssVariables: themeTokensToCssVars(electaDefaultTokens),
  },
  PAGEANT_EDITORIAL: {
    id: "PAGEANT_EDITORIAL",
    slug: "pageant-editorial",
    displayName: "Pageant Editorial Haute-Couture",
    description: "Understated luxury, champagne accents, Cormorant Garamond typography, and dark atmosphere tailored for national pageants.",
    tokens: pageantEditorialTokens,
    cssVariables: themeTokensToCssVars(pageantEditorialTokens),
  },
};

/**
 * Type guard for checking if an unknown value is a supported EventTheme.
 */
export function isKnownTheme(value: unknown): value is EventTheme {
  return typeof value === "string" && (EVENT_THEMES as readonly string[]).includes(value);
}

/**
 * Safely resolves an event theme from database or user input.
 * Falls back to ELECTA_DEFAULT if the value is missing, deprecated, or corrupted,
 * logging a warning for unexpected string values.
 */
export function resolveEventTheme(rawTheme?: unknown): ThemeDefinition {
  if (isKnownTheme(rawTheme)) {
    return THEME_REGISTRY[rawTheme];
  }

  if (rawTheme !== null && rawTheme !== undefined && rawTheme !== "") {
    console.warn(
      `[ThemeEngine] Unknown or deprecated theme "${String(rawTheme)}". Falling back to ELECTA_DEFAULT.`,
    );
  }

  return THEME_REGISTRY.ELECTA_DEFAULT;
}
