import { z } from "zod";
import { EVENT_THEMES, type EventTheme } from "@/features/events/types/theme";

export const themeSelectionInputSchema = z.object({
  theme: z.enum(EVENT_THEMES),
});

export type ThemeSelectionInput = z.infer<typeof themeSelectionInputSchema>;

export interface ThemeSelectorCardContract {
  id: EventTheme;
  displayName: string;
  description: string;
  tokens: {
    bgBase: string;
    bgSurface: string;
    accentPrimary: string;
    accentSecondary: string;
    textPrimary: string;
    textSecondary: string;
    fontHeading: string;
    fontBody: string;
  };
}
