export function normalizeSearchText(text: string | null | undefined): string {
  if (!text) return "";
  return text.trim().toLowerCase();
}

export interface FilterableEvent {
  title: string;
  description?: string | null;
  slug?: string | null;
}

export function filterEventsByQuery<T extends FilterableEvent>(events: T[], rawQuery: string): T[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) return events;

  return events.filter((event) => {
    const titleMatch = normalizeSearchText(event.title).includes(query);
    const descMatch = normalizeSearchText(event.description).includes(query);
    const slugMatch = normalizeSearchText(event.slug).includes(query);
    return titleMatch || descMatch || slugMatch;
  });
}

export interface FilterableContestant {
  name: string;
  hometown?: string | null;
  bio?: string | null;
  contestantNumber?: number | null;
}

export function filterContestantsByQuery<T extends FilterableContestant>(
  contestants: T[],
  rawQuery: string,
): T[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) return contestants;

  return contestants.filter((contestant) => {
    const nameMatch = normalizeSearchText(contestant.name).includes(query);
    const hometownMatch = normalizeSearchText(contestant.hometown).includes(query);
    const bioMatch = normalizeSearchText(contestant.bio).includes(query);
    const numberMatch =
      contestant.contestantNumber !== null &&
      contestant.contestantNumber !== undefined &&
      contestant.contestantNumber.toString() === query;

    return nameMatch || hometownMatch || bioMatch || numberMatch;
  });
}
