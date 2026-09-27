import type { NextRequest, NextResponse } from "next/server";

import { createEvent } from "@/features/events/services/create-event";
import { createEventSchema, type CreateEventInput } from "@/lib/validations/event";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import type { PublicEventDto } from "@/features/events/types";
import type { Event } from "@/generated/client/client";
import {
  mockScheduledEvent,
  mockActiveEvent,
  mockClosedEvent,
} from "@/features/events/utils/mock-data";

export async function GET(): Promise<NextResponse<ApiResponse<PublicEventDto[]>>> {
  return apiSuccess([mockScheduledEvent, mockActiveEvent, mockClosedEvent]);
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Event>>> {
  try {
    const body = (await request.json()) as CreateEventInput;
    const validation = createEventSchema.safeParse(body);

    if (!validation.success) {
      return apiError(validation.error.issues.map((i) => i.message).join(", "), 400);
    }

    const result = await createEvent(validation.data);

    if (!result.success) {
      if (result.error.includes("Unauthorized")) {
        return apiError(result.error, 401);
      }
      if (result.error.includes("already exists")) {
        return apiError(result.error, 409);
      }
      return apiError(result.error, 400);
    }

    return apiSuccess(result.data, 201);
  } catch (error) {
    console.error("Error creating event:", error);
    return apiError("Internal server error while creating event", 500);
  }
}
