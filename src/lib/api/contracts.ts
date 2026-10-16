import { z } from "zod";

import {
  createEventSchema,
  checkSlugQuerySchema,
  previewAuthSchema,
} from "@/lib/validations/event";
import { CastVoteInputSchema } from "@/features/voting/types";
import { createPaymentIntentSchema, verifyPaymentSchema } from "@/features/payments/types";
import { searchQuerySchema } from "@/features/search/types";
import { createContestantSchema, updateContestantStatusSchema } from "@/lib/validations/contestant";
import { createDivisionSchema } from "@/lib/validations/division";
import { createAwardCategorySchema } from "@/lib/validations/category-awards";
import { castBallotSchema } from "@/lib/validations/ballot";
import { createPayoutRequestSchema } from "@/lib/validations/payout";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RouteContractDefinition {
  path: string;
  method: HttpMethod;
  summary: string;
  tags: string[];
  authenticated: boolean;
  paramsSchema?: z.ZodTypeAny | undefined;
  querySchema?: z.ZodTypeAny | undefined;
  requestSchema?: z.ZodTypeAny | undefined;
  responseDescription?: string | undefined;
}

export interface RouteJsonContract {
  path: string;
  method: HttpMethod;
  summary: string;
  tags: string[];
  authenticated: boolean;
  paramsJsonSchema?: Record<string, unknown> | null | undefined;
  queryJsonSchema?: Record<string, unknown> | null | undefined;
  requestJsonSchema?: Record<string, unknown> | null | undefined;
  responseDescription?: string | undefined;
}

export const ROUTE_CONTRACTS: RouteContractDefinition[] = [
  {
    path: "/api/events",
    method: "POST",
    summary: "Create a new election, pageant, or hackathon event",
    tags: ["Events"],
    authenticated: true,
    requestSchema: createEventSchema,
    responseDescription: "Created event object with initial status",
  },
  {
    path: "/api/events/check-slug",
    method: "GET",
    summary: "Check availability of an event URL slug",
    tags: ["Events"],
    authenticated: false,
    querySchema: checkSlugQuerySchema,
    responseDescription: "Slug availability result",
  },
  {
    path: "/api/events/[slug]/preview-auth",
    method: "POST",
    summary: "Authenticate organizer or judge preview passphrase for draft event",
    tags: ["Events", "Auth"],
    authenticated: false,
    requestSchema: previewAuthSchema,
    responseDescription: "Preview cookie session grant",
  },
  {
    path: "/api/events/[slug]/vote",
    method: "POST",
    summary: "Cast a vote for a candidate in an event (free or boost)",
    tags: ["Voting"],
    authenticated: true,
    requestSchema: CastVoteInputSchema,
    responseDescription: "Vote confirmation with updated vote counts",
  },
  {
    path: "/api/voting",
    method: "POST",
    summary: "Direct voting engine endpoint for candidate voting",
    tags: ["Voting"],
    authenticated: true,
    requestSchema: CastVoteInputSchema,
    responseDescription: "Vote transaction result and quota state",
  },
  {
    path: "/api/events/[slug]/contestants",
    method: "POST",
    summary: "Register or add a contestant to an event",
    tags: ["Contestants"],
    authenticated: true,
    requestSchema: createContestantSchema,
    responseDescription: "Created contestant profile",
  },
  {
    path: "/api/events/[slug]/contestants/[contestantId]/status",
    method: "PATCH",
    summary: "Update contestant participation status (ACTIVE, HIDDEN, WITHDRAWN)",
    tags: ["Contestants"],
    authenticated: true,
    requestSchema: updateContestantStatusSchema,
    responseDescription: "Updated contestant status",
  },
  {
    path: "/api/events/[slug]/divisions",
    method: "POST",
    summary: "Create a competition division (e.g., Male, Female, Teens)",
    tags: ["Divisions"],
    authenticated: true,
    requestSchema: createDivisionSchema,
    responseDescription: "Created division object",
  },
  {
    path: "/api/events/[slug]/award-categories",
    method: "POST",
    summary: "Create special award category",
    tags: ["Awards"],
    authenticated: true,
    requestSchema: createAwardCategorySchema,
    responseDescription: "Created award category",
  },
  {
    path: "/api/payments/intent",
    method: "POST",
    summary: "Create payment intent for boost voting via PayMongo / QR Ph",
    tags: ["Payments"],
    authenticated: false,
    requestSchema: createPaymentIntentSchema,
    responseDescription: "Payment intent containing QR Ph payload and checkout URL",
  },
  {
    path: "/api/payments/verify",
    method: "POST",
    summary: "Verify payment transaction status by reference number",
    tags: ["Payments"],
    authenticated: false,
    requestSchema: verifyPaymentSchema,
    responseDescription: "Payment status, receipts, and awarded votes",
  },
  {
    path: "/api/search",
    method: "GET",
    summary: "Global search across events, contestants, and categories",
    tags: ["Search"],
    authenticated: false,
    querySchema: searchQuerySchema,
    responseDescription: "Search match results across entities",
  },
  {
    path: "/api/events/[slug]/ballot",
    method: "POST",
    summary: "Submit institutional student council multi-office ballot",
    tags: ["Ballots"],
    authenticated: true,
    requestSchema: castBallotSchema,
    responseDescription: "Cryptographic ballot receipt and selection records",
  },
  {
    path: "/api/events/[slug]/payout",
    method: "POST",
    summary: "Request organizer revenue payout via bank or e-wallet",
    tags: ["Payouts"],
    authenticated: true,
    requestSchema: createPayoutRequestSchema,
    responseDescription: "Created payout request with reference number",
  },
];

/**
 * Converts a Zod schema to standard JSON Schema format using native Zod capabilities.
 */
export function convertZodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const json = z.toJSONSchema(schema);
  return json as unknown as Record<string, unknown>;
}

/**
 * Returns all registered route contracts with their Zod schemas transformed into standard JSON schemas.
 */
export function getApiContracts(): RouteJsonContract[] {
  return ROUTE_CONTRACTS.map((contract) => ({
    path: contract.path,
    method: contract.method,
    summary: contract.summary,
    tags: contract.tags,
    authenticated: contract.authenticated,
    paramsJsonSchema: contract.paramsSchema ? convertZodToJsonSchema(contract.paramsSchema) : null,
    queryJsonSchema: contract.querySchema ? convertZodToJsonSchema(contract.querySchema) : null,
    requestJsonSchema: contract.requestSchema
      ? convertZodToJsonSchema(contract.requestSchema)
      : null,
    responseDescription: contract.responseDescription,
  }));
}

/**
 * Finds a single route contract by path and optional method.
 */
export function getRouteContract(path: string, method?: HttpMethod): RouteJsonContract | null {
  const found = ROUTE_CONTRACTS.find(
    (c) =>
      c.path.toLowerCase() === path.toLowerCase() &&
      (!method || c.method.toUpperCase() === method.toUpperCase()),
  );

  if (!found) return null;

  return {
    path: found.path,
    method: found.method,
    summary: found.summary,
    tags: found.tags,
    authenticated: found.authenticated,
    paramsJsonSchema: found.paramsSchema ? convertZodToJsonSchema(found.paramsSchema) : null,
    queryJsonSchema: found.querySchema ? convertZodToJsonSchema(found.querySchema) : null,
    requestJsonSchema: found.requestSchema ? convertZodToJsonSchema(found.requestSchema) : null,
    responseDescription: found.responseDescription,
  };
}

export interface ValidationSuccess<T> {
  success: true;
  data: T;
  error?: undefined;
}

export interface ValidationFailure {
  success: false;
  data?: undefined;
  error: string;
  issues: z.ZodIssue[];
}

export type RouteValidationResult<T = unknown> = ValidationSuccess<T> | ValidationFailure;

/**
 * Direct payload validation helper for agents and client components.
 * Validates request payload against the registered route contract before dispatching network requests.
 */
export function validateRoutePayload<T = unknown>(
  path: string,
  method: HttpMethod,
  payload: unknown,
): RouteValidationResult<T> {
  const contract = ROUTE_CONTRACTS.find(
    (c) =>
      c.path.toLowerCase() === path.toLowerCase() &&
      c.method.toUpperCase() === method.toUpperCase(),
  );

  if (!contract) {
    return {
      success: false,
      error: `No contract registered for route ${method} ${path}`,
      issues: [],
    };
  }

  const schema = contract.requestSchema ?? contract.querySchema;
  if (!schema) {
    return {
      success: true,
      data: payload as T,
    };
  }

  const result = schema.safeParse(payload);
  if (result.success) {
    return {
      success: true,
      data: result.data as T,
    };
  }

  return {
    success: false,
    error: result.error.issues.map((i) => i.message).join(", "),
    issues: result.error.issues,
  };
}
