"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { EventTheme, ThemeDefinition, ThemeTokens } from "../types/theme";
import { resolveEventTheme, THEME_REGISTRY } from "./theme-registry";
import "./pageant-theme.css";

export interface EventThemeContextValue {
  theme: EventTheme;
  themeSlug: string;
  tokens: ThemeTokens;
  definition: ThemeDefinition;
}

const EventThemeContext = createContext<EventThemeContextValue>({
  theme: "ELECTA_DEFAULT",
  themeSlug: THEME_REGISTRY.ELECTA_DEFAULT.slug,
  tokens: THEME_REGISTRY.ELECTA_DEFAULT.tokens,
  definition: THEME_REGISTRY.ELECTA_DEFAULT,
});

export interface EventThemeProviderProps {
  theme?: unknown;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * EventThemeProvider scopes dynamic event visual theme tokens, injecting
 * `data-event-theme` and CSS custom variables onto the container.
 * SSR generates these attributes directly in the initial HTML to prevent FOUT.
 */
export function EventThemeProvider({
  theme,
  className,
  style,
  children,
}: Readonly<EventThemeProviderProps>): React.JSX.Element {
  const resolved = useMemo(() => resolveEventTheme(theme), [theme]);

  const contextValue: EventThemeContextValue = useMemo(
    () => ({
      theme: resolved.id,
      themeSlug: resolved.slug,
      tokens: resolved.tokens,
      definition: resolved,
    }),
    [resolved],
  );

  const combinedStyles: React.CSSProperties = useMemo(
    () => ({
      ...(resolved.cssVariables as unknown as React.CSSProperties),
      ...style,
    }),
    [resolved.cssVariables, style],
  );

  return (
    <EventThemeContext.Provider value={contextValue}>
      <div
        data-event-theme={resolved.slug}
        className={className}
        style={combinedStyles}
      >
        {children}
      </div>
    </EventThemeContext.Provider>
  );
}

/**
 * Hook to access current dynamic event theme tokens and metadata.
 */
export function useEventTheme(): EventThemeContextValue {
  return useContext(EventThemeContext);
}
