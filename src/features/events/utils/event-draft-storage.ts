export const EVENT_CREATE_DRAFT_KEY = "electa:create_event_draft";

export interface CreateEventDraftData {
  title: string;
  slug: string;
  description: string;
  bannerUrl: string;
  startsAt: string;
  endsAt: string;
  isCustomSlug?: boolean | undefined;
  archetype?: string | undefined;
}

interface StoredDraftEnvelope extends CreateEventDraftData {
  savedAt: number;
}

function getSafeSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function saveDraftToSession(draft: CreateEventDraftData): void {
  const storage = getSafeSessionStorage();
  if (!storage) return;

  try {
    const envelope: StoredDraftEnvelope = {
      ...draft,
      savedAt: Date.now(),
    };
    storage.setItem(EVENT_CREATE_DRAFT_KEY, JSON.stringify(envelope));
  } catch {
    // Gracefully ignore storage quota errors or restricted environments
  }
}

export function loadDraftFromSession(): CreateEventDraftData | null {
  const storage = getSafeSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(EVENT_CREATE_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredDraftEnvelope>;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      slug: typeof parsed.slug === "string" ? parsed.slug : "",
      description: typeof parsed.description === "string" ? parsed.description : "",
      bannerUrl: typeof parsed.bannerUrl === "string" ? parsed.bannerUrl : "",
      startsAt: typeof parsed.startsAt === "string" ? parsed.startsAt : "",
      endsAt: typeof parsed.endsAt === "string" ? parsed.endsAt : "",
      isCustomSlug: Boolean(parsed.isCustomSlug),
      archetype: typeof parsed.archetype === "string" ? parsed.archetype : undefined,
    };
  } catch {
    return null;
  }
}

export function clearDraftFromSession(): void {
  const storage = getSafeSessionStorage();
  if (!storage) return;

  try {
    storage.removeItem(EVENT_CREATE_DRAFT_KEY);
  } catch {
    // Gracefully ignore
  }
}

export function hasDraftContent(draft: CreateEventDraftData | null): boolean {
  if (!draft) return false;
  return Boolean(
    draft.title?.trim() ||
      draft.slug?.trim() ||
      draft.description?.trim() ||
      draft.bannerUrl?.trim(),
  );
}
