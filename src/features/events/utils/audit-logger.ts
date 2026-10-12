import type { EventAuditLogDto } from "../types";

export interface CreateAuditLogParams {
  eventId: string;
  action: string;
  changedBy: string;
  previousVal: Record<string, unknown>;
  newVal: Record<string, unknown>;
  reason?: string | undefined;
}

export function createAuditLogEntry(params: CreateAuditLogParams): EventAuditLogDto {
  return {
    id: `log_${crypto.randomUUID()}`,
    eventId: params.eventId,
    action: params.action,
    changedBy: params.changedBy,
    previousVal: params.previousVal,
    newVal: params.newVal,
    reason: params.reason ?? null,
    createdAt: new Date().toISOString(),
  };
}
