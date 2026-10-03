/**
 * Server Action: updateContestantStatusAction
 * Authorization: Authenticated Event Organizer
 */
export interface UpdateContestantStatusInput {
  eventId: string;
  contestantId: string;
  status: "ACTIVE" | "HIDDEN" | "DISQUALIFIED" | "WITHDRAWN";
}

export interface UpdateContestantStatusResult {
  success: boolean;
  contestantId?: string;
  status?: string;
  error?: string;
}

/**
 * Server Action: reorderContestantsAction
 * Authorization: Authenticated Event Organizer
 */
export interface ReorderContestantsInput {
  eventId: string;
  divisionId?: string;
  orderedContestantIds: string[]; // Sequential IDs representing desired order
}

export interface ReorderContestantsResult {
  success: boolean;
  reorderedCount?: number;
  error?: string;
}
