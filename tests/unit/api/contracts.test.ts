import { NextRequest } from "next/server";
import { describe, it, expect } from "vitest";
import { getApiContracts, getRouteContract, validateRoutePayload } from "@/lib/api/contracts";
import { GET } from "@/app/api/contracts/route";

describe("API Contracts Catalog & Schema Validator", () => {
  it("exports valid JSON Schema definitions for all registered route handlers", () => {
    const contracts = getApiContracts();

    expect(contracts.length).toBeGreaterThan(10);

    const eventContract = contracts.find((c) => c.path === "/api/events" && c.method === "POST");
    expect(eventContract).toBeDefined();
    expect(eventContract?.requestJsonSchema).toBeDefined();
    expect(eventContract?.requestJsonSchema?.type).toBe("object");

    const voteContract = contracts.find((c) => c.path === "/api/voting" && c.method === "POST");
    expect(voteContract).toBeDefined();
    expect(voteContract?.requestJsonSchema).toBeDefined();
  });

  it("finds a single contract by path and method", () => {
    const contract = getRouteContract("/api/events/check-slug", "GET");
    expect(contract).toBeDefined();
    expect(contract?.path).toBe("/api/events/check-slug");
    expect(contract?.queryJsonSchema).toBeDefined();
  });

  it("returns null when querying an unregistered route", () => {
    const contract = getRouteContract("/api/nonexistent", "GET");
    expect(contract).toBeNull();
  });

  it("successfully validates valid payload using validateRoutePayload", () => {
    const validVotePayload = {
      eventId: "11111111-1111-4111-a111-111111111111",
      contestantId: "22222222-2222-4222-a222-222222222222",
      voteType: "FREE" as const,
      voteWeight: 1,
    };

    const result = validateRoutePayload("/api/voting", "POST", validVotePayload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject(validVotePayload);
    }
  });

  it("rejects invalid payloads with actionable error messages", () => {
    const invalidVotePayload = {
      eventId: "invalid-uuid",
      contestantId: "",
      voteType: "INVALID_TYPE",
    };

    const result = validateRoutePayload("/api/voting", "POST", invalidVotePayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });

  it("route handler GET /api/contracts returns list of contracts", async () => {
    const request = new NextRequest("http://localhost:3000/api/contracts");
    const response = await GET(request);
    const body = (await response.json()) as {
      success: boolean;
      data: { totalContracts: number; contracts: unknown[] };
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.totalContracts).toBeGreaterThan(10);
    expect(Array.isArray(body.data.contracts)).toBe(true);
  });

  it("route handler GET /api/contracts?path=/api/events filters to requested route", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/contracts?path=/api/events&method=POST",
    );
    const response = await GET(request);
    const body = (await response.json()) as {
      success: boolean;
      data: { path: string; method: string };
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.path).toBe("/api/events");
    expect(body.data.method).toBe("POST");
  });

  it("route handler GET /api/contracts?path=/api/not-found returns 404", async () => {
    const request = new NextRequest("http://localhost:3000/api/contracts?path=/api/not-found");
    const response = await GET(request);
    const body = (await response.json()) as {
      success: boolean;
      error: string;
    };

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error).toContain("Contract not found");
  });
});
