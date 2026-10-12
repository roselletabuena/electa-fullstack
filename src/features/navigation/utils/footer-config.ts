import type { FooterConfig } from "../types";

export const DEFAULT_SITE_FOOTER_CONFIG: FooterConfig = {
  brand: {
    title: "ELECTA",
    tagline: "Vote. Engage. Celebrate.",
    description:
      "Universal contest, pageant, and high-stakes voting engine built with institutional trust and verifiable audit integrity.",
    logoSrc: "/electa-logo-dark.svg",
    homeHref: "/",
  },
  sections: [
    {
      id: "explore",
      title: "Explore",
      links: [
        {
          id: "explore-trending",
          label: "Trending Events",
          href: "/events?filter=trending",
          ariaLabel: "Browse trending events",
        },
        {
          id: "explore-live",
          label: "Live Voting",
          href: "/events?filter=live",
          ariaLabel: "View active live voting events",
        },
        {
          id: "explore-concluded",
          label: "Concluded Events",
          href: "/events?filter=concluded",
          ariaLabel: "View concluded events and winners",
        },
        {
          id: "explore-search",
          label: "Search",
          href: "/search",
          ariaLabel: "Search events, categories, and contestants",
        },
      ],
    },
    {
      id: "organizers",
      title: "Organizers",
      links: [
        {
          id: "organizers-create",
          label: "Create Event",
          href: "/events/new",
          ariaLabel: "Create a new pageant or contest event",
        },
        {
          id: "organizers-portal",
          label: "Organizer Portal",
          href: "/dashboard",
          ariaLabel: "Access the organizer management portal",
        },
        {
          id: "organizers-pricing",
          label: "Pricing",
          href: "/pricing",
          ariaLabel: "View platform fee structure and pricing",
        },
        {
          id: "organizers-guidelines",
          label: "Guidelines",
          href: "/guidelines",
          ariaLabel: "Read organizer guidelines and compliance requirements",
        },
      ],
    },
    {
      id: "platform",
      title: "Platform",
      links: [
        {
          id: "platform-about",
          label: "About Electa",
          href: "/about",
          ariaLabel: "Learn more about the Electa platform",
        },
        {
          id: "platform-security",
          label: "Security",
          href: "/security",
          ariaLabel: "Platform security architecture and fraud mitigation",
        },
        {
          id: "platform-status",
          label: "System Status",
          href: "/status",
          ariaLabel: "Check realtime platform uptime and system status",
        },
        {
          id: "platform-docs",
          label: "API Docs",
          href: "/docs/api",
          ariaLabel: "Read developer API documentation",
        },
      ],
    },
    {
      id: "legal",
      title: "Legal",
      links: [
        {
          id: "legal-terms",
          label: "Terms of Service",
          href: "/terms",
          ariaLabel: "View Terms of Service",
        },
        {
          id: "legal-privacy",
          label: "Privacy Policy",
          href: "/privacy",
          ariaLabel: "Read our Privacy Policy",
        },
        {
          id: "legal-audit",
          label: "Audit Integrity",
          href: "/audit",
          ariaLabel: "Platform vote verification and cryptographic audit integrity",
        },
      ],
    },
  ],
  legal: {
    copyright: "© 2026 Electa Platform. All Rights Reserved.",
    statusText: "SYSTEM OPERATIONAL · AUDIT VERIFIED",
  },
};
