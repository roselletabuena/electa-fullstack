import type { Event } from "@/generated/client/client";
import type { UserSession } from "@/lib/auth/get-session";

export type EventPublicationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type EventOperationalState = "Draft" | "Scheduled" | "Active" | "Closed";

export const SETTINGS_TABS = ["general", "schedule", "voting-rules"] as const;
export type SettingsTabId = (typeof SETTINGS_TABS)[number];

export interface SettingsTabConfig {
  id: SettingsTabId;
  label: string;
  description: string;
  badge?: string;
}

export type OwnershipCheckResult =
  | { authorized: true; event: Event; session: UserSession }
  | { authorized: false; reason: "UNAUTHENTICATED" }
  | { authorized: false; reason: "NOT_FOUND" }
  | { authorized: false; reason: "UNAUTHORIZED"; session: UserSession; eventTitle: string };

export interface ContestantDto {
  id: string;
  contestantNumber: number;
  name: string;
  bio: string;
  avatarUrl: string;
  voteCount: number | null;
}

export interface PublicEventDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerUrl: string;
  startsAt: string;
  endsAt: string;
  serverTime: string;
  operationalState: EventOperationalState;
  showResultsOnClose: boolean;
  contestants: ContestantDto[];
}

export interface EventAuditLogDto {
  id: string;
  eventId: string;
  action: string;
  changedBy: string;
  previousVal: Record<string, unknown>;
  newVal: Record<string, unknown>;
  reason: string | null;
  createdAt: string;
}

export interface SaveEventInput {
  title: string;
  slug: string;
  description: string;
  bannerUrl: string;
  startsAt: string;
  endsAt: string;
  publicationStatus?: EventPublicationStatus | undefined;
  draftPassphrase?: string | undefined;
  showResultsOnClose?: boolean | undefined;
  reason?: string | undefined;
}

export interface PreviewAuthInput {
  passphrase: string;
}

export interface PreviewAuthResponse {
  previewToken: string;
  expiresAt: string;
}
