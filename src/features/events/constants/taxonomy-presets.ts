export interface PresetDivision {
  name: string;
  description?: string;
  displayOrder: number;
}

export interface PresetAwardCategory {
  name: string;
  description?: string;
  isVotingOpen: boolean;
  displayOrder: number;
}

export interface TaxonomyPreset {
  id: string;
  title: string;
  badge: string;
  description: string;
  iconName: "crown" | "music" | "sparkles" | "trophy";
  divisions: PresetDivision[];
  awardCategories: PresetAwardCategory[];
}

export const TAXONOMY_PRESETS: readonly TaxonomyPreset[] = [
  {
    id: "beauty-pageant",
    title: "Beauty Pageant",
    badge: "Popular",
    description:
      "Standard pageant setup with female, male, LGBTQ+, and teen brackets with specialized award tracks.",
    iconName: "crown",
    divisions: [
      {
        name: "Female Category",
        description: "Standard female contestants bracket",
        displayOrder: 0,
      },
      { name: "Male Category", description: "Standard male contestants bracket", displayOrder: 1 },
      {
        name: "LGBTQ+ Category",
        description: "All-inclusive LGBTQ+ contestants bracket",
        displayOrder: 2,
      },
      { name: "Teen Category", description: "Youth / Teen division", displayOrder: 3 },
    ],
    awardCategories: [
      {
        name: "People's Choice Award",
        description: "Open public popular vote",
        isVotingOpen: true,
        displayOrder: 0,
      },
      {
        name: "Best in Evening Gown",
        description: "Judged gala competition",
        isVotingOpen: false,
        displayOrder: 1,
      },
      {
        name: "Best in Swimsuit",
        description: "Swimwear segment",
        isVotingOpen: false,
        displayOrder: 2,
      },
      {
        name: "Miss Congeniality",
        description: "Fellow contestant voted award",
        isVotingOpen: false,
        displayOrder: 3,
      },
      {
        name: "Photogenic Award",
        description: "Public media choice",
        isVotingOpen: true,
        displayOrder: 4,
      },
    ],
  },
  {
    id: "talent-singing",
    title: "Singing & Talent Show",
    badge: "Music",
    description:
      "Vocal and variety talent showcase with audience choice and judges performance tracks.",
    iconName: "music",
    divisions: [
      { name: "Solo Vocalist", description: "Individual solo singers", displayOrder: 0 },
      {
        name: "Duet / Acoustic Group",
        description: "Small ensembles and acoustic acts",
        displayOrder: 1,
      },
      { name: "Band / Choir", description: "Full bands and group performances", displayOrder: 2 },
    ],
    awardCategories: [
      {
        name: "Audience Favorite Award",
        description: "Live viewer popular voting",
        isVotingOpen: true,
        displayOrder: 0,
      },
      {
        name: "Best Vocal Performance",
        description: "Judged vocal technique & range",
        isVotingOpen: false,
        displayOrder: 1,
      },
      {
        name: "Best Stage Presence",
        description: "Showmanship & charisma award",
        isVotingOpen: false,
        displayOrder: 2,
      },
    ],
  },
  {
    id: "dance-championship",
    title: "Dance Championship",
    badge: "Dance",
    description:
      "Street dance, hip-hop, and contemporary dance battle divisions with crowd impact voting.",
    iconName: "sparkles",
    divisions: [
      { name: "Junior Division", description: "Performers 14 and under", displayOrder: 0 },
      { name: "Varsity Division", description: "High school & collegiate crews", displayOrder: 1 },
      { name: "Open Mega Crew", description: "All-age mega crew division", displayOrder: 2 },
    ],
    awardCategories: [
      {
        name: "People's Choice Crew",
        description: "Public favorite dance crew",
        isVotingOpen: true,
        displayOrder: 0,
      },
      {
        name: "Best Choreography",
        description: "Technical choreo excellence",
        isVotingOpen: false,
        displayOrder: 1,
      },
      {
        name: "Crowd Impact Award",
        description: "Highest energy performance",
        isVotingOpen: true,
        displayOrder: 2,
      },
    ],
  },
  {
    id: "academic-hackathon",
    title: "Hackathon & Tech Expo",
    badge: "Tech",
    description: "Multi-track developer and innovation competition with community choice voting.",
    iconName: "trophy",
    divisions: [
      {
        name: "Track A - Web & Cloud",
        description: "Web applications and cloud services",
        displayOrder: 0,
      },
      {
        name: "Track B - AI & Data",
        description: "Machine learning and data innovations",
        displayOrder: 1,
      },
      {
        name: "Track C - Social Impact",
        description: "Civic tech and sustainability projects",
        displayOrder: 2,
      },
    ],
    awardCategories: [
      {
        name: "Community Choice Project",
        description: "Attendee and online voter favorite",
        isVotingOpen: true,
        displayOrder: 0,
      },
      {
        name: "Best Innovation",
        description: "Most original technical concept",
        isVotingOpen: false,
        displayOrder: 1,
      },
      {
        name: "Best Technical Execution",
        description: "Engineering quality and architecture",
        isVotingOpen: false,
        displayOrder: 2,
      },
    ],
  },
] as const;
