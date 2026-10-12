import type {
  EventLifecycleFilter,
  EventOperationalState,
  EventCountdownSnapshot,
  PublicEventDto,
} from "../types";

/**
 * Maps event operational lifecycle state to user-facing CTA button label
 */
export function getActionLabelForStatus(state: EventOperationalState): string {
  switch (state) {
    case "Active":
      return "VIEW EVENT →";
    case "Scheduled":
      return "PREVIEW EVENT →";
    case "Closed":
      return "VIEW FINAL TALLIES →";
    case "Draft":
      return "PREVIEW DRAFT →";
    default:
      return "VIEW EVENT →";
  }
}

function formatScheduledCountdown(startsAt: string, currentMs: number): string {
  const targetMs = new Date(startsAt).getTime();
  const diffMs = Math.max(0, targetMs - currentMs);

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    return hours > 0 ? `OPENS IN ${days}D ${hours}H` : `OPENS IN ${days}D`;
  }
  if (hours > 0) {
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return minutes > 0 ? `OPENS IN ${hours}H ${minutes}M` : `OPENS IN ${hours}H`;
  }
  return "OPENS SHORTLY";
}

function formatActiveCountdown(
  endsAt: string,
  currentMs: number,
): { label: string; isUrgent: boolean } {
  const targetMs = new Date(endsAt).getTime();
  const diffMs = Math.max(0, targetMs - currentMs);

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return {
      label: hours > 0 ? `⏳ ${days}D ${hours}H LEFT` : `⏳ ${days}D LEFT`,
      isUrgent: false,
    };
  }
  if (hours > 0) {
    return {
      label: minutes > 0 ? `⏳ ${hours}H ${minutes}M LEFT` : `⏳ ${hours}H LEFT`,
      isUrgent: hours < 3,
    };
  }
  if (minutes > 0) {
    return {
      label: `⏳ ${minutes}M LEFT`,
      isUrgent: true,
    };
  }
  return {
    label: "⏳ CLOSING NOW",
    isUrgent: true,
  };
}

/**
 * Computes human-readable countdown text and visual pill variant
 */
export function formatLifecycleCountdown(
  event: PublicEventDto,
  referenceTime: Date | string | number = new Date(),
): EventCountdownSnapshot {
  const actionLabel = getActionLabelForStatus(event.operationalState);

  if (event.operationalState === "Closed") {
    return {
      pillLabel: "FINAL TALLIES",
      pillVariant: "closed",
      actionLabel,
      isUrgent: false,
    };
  }

  const currentMs =
    typeof referenceTime === "number" ? referenceTime : new Date(referenceTime).getTime();

  if (event.operationalState === "Scheduled") {
    return {
      pillLabel: formatScheduledCountdown(event.startsAt, currentMs),
      pillVariant: "scheduled",
      actionLabel,
      isUrgent: false,
    };
  }

  const activeResult = formatActiveCountdown(event.endsAt, currentMs);
  return {
    pillLabel: activeResult.label,
    pillVariant: "active",
    actionLabel,
    isUrgent: activeResult.isUrgent,
  };
}

/**
 * Pure function to filter public events by lifecycle filter
 * Strictly filters out unpublished/draft events from discovery
 */
export function filterEventsByLifecycle(
  events: PublicEventDto[],
  filter: EventLifecycleFilter,
): PublicEventDto[] {
  // Never show draft events in public trending grid
  const published = events.filter((e) => e.operationalState !== "Draft");

  switch (filter) {
    case "active":
      return published.filter((e) => e.operationalState === "Active");
    case "scheduled":
      return published.filter((e) => e.operationalState === "Scheduled");
    case "closed":
      return published.filter((e) => e.operationalState === "Closed");
    case "all":
    default:
      return published;
  }
}
