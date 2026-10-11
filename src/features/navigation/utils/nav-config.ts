import type { SiteHeaderConfig } from "../types";

export const DEFAULT_SITE_HEADER_CONFIG: SiteHeaderConfig = {
  brand: {
    title: "ELECTA",
    tagline: "VOTE · ENGAGE · CELEBRATE",
    href: "/",
  },
  actions: [
    {
      id: "create-event",
      label: "+ Create Event",
      href: "/events/new",
      variant: "portal",
      ariaLabel: "Create a new pageant or contest event",
    },
    {
      id: "sign-in",
      label: "Sign In",
      href: "/login",
      variant: "primary",
      ariaLabel: "Sign in to your Electa account",
    },
  ],
};
