import type { DivisionDto, AwardCategoryDto } from "./index";

export const EVENT_ARCHETYPES = [
  "PAGEANT",
  "STUDENT_COUNCIL",
  "HACKATHON",
  "CUSTOM",
] as const;

export type EventArchetype = (typeof EVENT_ARCHETYPES)[number];

export const ACTIVE_ARCHETYPES = ["PAGEANT"] as const;
export type ActiveEventArchetype = (typeof ACTIVE_ARCHETYPES)[number];

export const COMING_SOON_ARCHETYPES = [
  "STUDENT_COUNCIL",
  "HACKATHON",
  "CUSTOM",
] as const;
export type ComingSoonEventArchetype = (typeof COMING_SOON_ARCHETYPES)[number];

export function isArchetypeAvailable(archetype: EventArchetype): boolean {
  return archetype === "PAGEANT";
}

export function isArchetypeComingSoon(archetype: EventArchetype): boolean {
  return archetype !== "PAGEANT";
}

export interface ArchetypeConfig {
  id: EventArchetype;
  label: string;
  description: string;
  groupingTerm: string;
  candidateTerm: string;
  allowMultipleSelections: boolean;
  defaultMaxSelections: number;
  isComingSoon?: boolean;
}

export const EVENT_ARCHETYPE_CONFIGS: Record<EventArchetype, ArchetypeConfig> = {
  PAGEANT: {
    id: "PAGEANT",
    label: "Beauty Pageant",
    description: "Traditional pageantry with divisions, contestant numbers, and award categories.",
    groupingTerm: "Division",
    candidateTerm: "Contestant",
    allowMultipleSelections: false,
    defaultMaxSelections: 1,
    isComingSoon: false,
  },
  STUDENT_COUNCIL: {
    id: "STUDENT_COUNCIL",
    label: "Student Council Election",
    description: "Campus elections with executive offices, legislative bodies, and multi-seat positions.",
    groupingTerm: "Office / Position",
    candidateTerm: "Candidate",
    allowMultipleSelections: true,
    defaultMaxSelections: 1,
    isComingSoon: true,
  },
  HACKATHON: {
    id: "HACKATHON",
    label: "Hackathon / Competition",
    description: "Innovation hackathons and pitch competitions organized by project tracks and sponsor challenges.",
    groupingTerm: "Track",
    candidateTerm: "Team / Project",
    allowMultipleSelections: false,
    defaultMaxSelections: 1,
    isComingSoon: true,
  },
  CUSTOM: {
    id: "CUSTOM",
    label: "Custom Contest",
    description: "Flexible voting event with customized taxonomy grouping and selection rules.",
    groupingTerm: "Group / Category",
    candidateTerm: "Nominee",
    allowMultipleSelections: true,
    defaultMaxSelections: 1,
    isComingSoon: true,
  },
};

export interface EventPositionDto {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  maxSelectionsPerVoter: number;
  minSelectionsPerVoter: number;
  displayOrder: number;
  isVotingOpen: boolean;
  candidateCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedTaxonomyDto {
  archetype: EventArchetype;
  positions: EventPositionDto[];
  divisions: DivisionDto[];
  awardCategories: AwardCategoryDto[];
}
