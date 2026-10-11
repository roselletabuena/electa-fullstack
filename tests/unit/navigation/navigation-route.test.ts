import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/navigation/route";
import { DEFAULT_SITE_HEADER_CONFIG } from "@/features/navigation/utils/nav-config";

describe("GET /api/navigation", () => {
  it("returns 200 OK with default navigation configuration envelope", async () => {
    const response = GET();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(DEFAULT_SITE_HEADER_CONFIG);
    expect(json.data.brand.title).toBe("ELECTA");
    expect(json.data.actions).toHaveLength(2);
    expect(json.timestamp).toBeDefined();
  });
});
