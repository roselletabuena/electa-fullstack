import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  parsePrismaSchema,
  generateSchemaSummaryMarkdown,
  estimateTokenCount,
} from "../../../scripts/generate-schema-summary.mjs";

describe("generate-schema-summary tooling", () => {
  const schemaPath = path.resolve(process.cwd(), "prisma", "schema.prisma");
  const rawSchema = fs.readFileSync(schemaPath, "utf8");

  it("successfully parses models and enums from prisma/schema.prisma", () => {
    const { enums, models } = parsePrismaSchema(rawSchema);

    expect(enums.size).toBeGreaterThan(5);
    expect(enums.has("EventPublicationStatus")).toBe(true);
    expect(enums.has("VoteType")).toBe(true);

    expect(models.length).toBeGreaterThan(15);
    const eventModel = models.find((m) => m.model === "Event");
    expect(eventModel).toBeDefined();
    expect(eventModel?.scalarFields).toContain("slug");
    expect(eventModel?.scalarFields).toContain("title");
  });

  it("generates markdown containing models table and valid mermaid ERD", () => {
    const parsed = parsePrismaSchema(rawSchema);
    const markdown = generateSchemaSummaryMarkdown(parsed);

    expect(markdown).toContain("# Electa DB Schema Summary");
    expect(markdown).toContain("| Model | Fields | Relations |");
    expect(markdown).toContain("```mermaid");
    expect(markdown).toContain("erDiagram");
    expect(markdown).toContain("Event ||--o{ Contestant : hosts");
    expect(markdown).toContain("## Enums");
  });

  it("strictly enforces token budget < 500 tokens for schema-summary.md", () => {
    const parsed = parsePrismaSchema(rawSchema);
    const markdown = generateSchemaSummaryMarkdown(parsed);
    const estimatedTokens = estimateTokenCount(markdown);

    expect(estimatedTokens).toBeLessThan(500);
    // Ensure character count is compact (< 2000 chars)
    expect(markdown.length).toBeLessThan(2000);
  });
});
