export interface TimelineDurationPreset {
  id: "7d" | "14d" | "30d";
  label: string;
  days: number;
}

export const TIMELINE_PRESETS: readonly TimelineDurationPreset[] = [
  { id: "7d", label: "+7 Days", days: 7 },
  { id: "14d", label: "+14 Days", days: 14 },
  { id: "30d", label: "+30 Days", days: 30 },
] as const;

export function formatLocalDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function calculateEndsAtFromDuration(startsAtStr: string, days: number): string {
  if (!startsAtStr) return "";
  const startDate = new Date(startsAtStr);
  if (Number.isNaN(startDate.getTime())) return "";

  const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
  return formatLocalDateTime(endDate);
}

export function getActivePreset(
  startsAtStr: string,
  endsAtStr: string,
): "7d" | "14d" | "30d" | null {
  if (!startsAtStr || !endsAtStr) return null;

  const starts = new Date(startsAtStr).getTime();
  const ends = new Date(endsAtStr).getTime();

  if (Number.isNaN(starts) || Number.isNaN(ends)) return null;

  const diffMs = ends - starts;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  for (const preset of TIMELINE_PRESETS) {
    if (diffMs === preset.days * ONE_DAY_MS) {
      return preset.id;
    }
  }

  return null;
}

export function isTemporalWindowValid(startsAtStr: string, endsAtStr: string): boolean {
  if (!startsAtStr || !endsAtStr) return false;

  const starts = new Date(startsAtStr).getTime();
  const ends = new Date(endsAtStr).getTime();

  if (Number.isNaN(starts) || Number.isNaN(ends)) return false;

  const ONE_HOUR_MS = 60 * 60 * 1000;
  return ends - starts >= ONE_HOUR_MS;
}
