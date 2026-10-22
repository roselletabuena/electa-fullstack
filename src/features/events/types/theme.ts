export const EVENT_THEMES = ["ELECTA_DEFAULT", "PAGEANT_EDITORIAL"] as const;

export type EventTheme = (typeof EVENT_THEMES)[number];

export interface ThemeTokens {
  bgBase: string;
  bgSurface: string;
  bgSurfaceElevated: string;
  bgSurfaceHover: string;
  borderHairline: string;
  borderAccent: string;
  borderAccentBright: string;
  accentPrimary: string;
  accentSecondary: string;
  accentMuted: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  fontHeading: string;
  fontBody: string;
  fontSerif?: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusPill: string;
}

export interface ThemeDefinition {
  id: EventTheme;
  slug: string;
  displayName: string;
  description: string;
  tokens: ThemeTokens;
  cssVariables: Record<string, string>;
}
