import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const schemaPath = path.join(rootDir, "prisma", "schema.prisma");
const outputPath = path.join(rootDir, "docs", "schema-summary.md");

const PRISMA_SCALARS = new Set([
  "String",
  "Int",
  "Float",
  "Boolean",
  "DateTime",
  "Json",
  "Decimal",
  "Bytes",
  "BigInt",
]);

/**
 * Standard token estimation heuristic.
 * Industry standard for LLM tokenization (tiktoken / BPE)
 * averages ~4.0 characters per token for English & Markdown text.
 */
export function estimateTokenCount(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4.0);
}

function parseEnums(rawSchema) {
  const enums = new Map();
  const enumRegex = /enum\s+(\w+)\s*\{([^}]+)\}/g;
  let enumMatch;
  while ((enumMatch = enumRegex.exec(rawSchema)) !== null) {
    const enumName = enumMatch[1];
    const values = enumMatch[2]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//"));
    enums.set(enumName, values);
  }
  return enums;
}

function shouldSkipField(fieldName) {
  if (fieldName === "id" || fieldName === "createdAt" || fieldName === "updatedAt") {
    return true;
  }
  return (
    fieldName.endsWith("Id") ||
    fieldName.endsWith("Ids") ||
    fieldName === "draftPassphraseHash" ||
    fieldName === "receiptHash" ||
    fieldName === "studentIdHash" ||
    fieldName === "voterIdentifier" ||
    fieldName === "notes" ||
    fieldName === "description" ||
    fieldName === "tagline"
  );
}

function normalizeRelation(typeName) {
  if (typeName === "ContestantCategoryAssignment") return "CategoryAssignment";
  if (typeName === "ProjectSubmissionLink") return "ProjectLink";
  if (typeName === "ProjectTrackTag") return "TrackTag";
  return typeName;
}

function compactScalarName(fieldName) {
  const compactMap = {
    referenceNumber: "refNo",
    maxSelectionsPerVoter: "maxSelect",
    minSelectionsPerVoter: "minSelect",
    previousVal: "prevVal",
    contestantNumber: "number",
    compositeScore: "score",
  };
  return compactMap[fieldName] || fieldName;
}

function parseModelLines(lines, enums) {
  let primaryKey = "id";
  const scalarFields = [];
  const relationFields = [];

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const [fieldName, fieldType] = parts;
    const cleanType = fieldType.replace("?", "").replace("[]", "");

    if (line.includes("@id")) {
      primaryKey = fieldName;
      continue;
    }

    if (shouldSkipField(fieldName)) {
      continue;
    }

    if (line.includes("@relation")) {
      relationFields.push(normalizeRelation(cleanType));
    } else if (PRISMA_SCALARS.has(cleanType) || enums.has(cleanType)) {
      scalarFields.push(compactScalarName(fieldName));
    } else {
      relationFields.push(normalizeRelation(cleanType));
    }
  }

  return { primaryKey, scalarFields, relationFields };
}

/**
 * Pure Node.js Prisma schema parser
 */
export function parsePrismaSchema(rawSchema) {
  const enums = parseEnums(rawSchema);
  const models = [];
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let modelMatch;

  while ((modelMatch = modelRegex.exec(rawSchema)) !== null) {
    const modelName = modelMatch[1];
    const body = modelMatch[2];
    const lines = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("//") && !l.startsWith("@@"));

    const { primaryKey, scalarFields, relationFields } = parseModelLines(lines, enums);

    models.push({
      model: modelName,
      primaryKey,
      scalarFields,
      relationFields,
    });
  }

  return { enums, models };
}

/**
 * Builds compact markdown document strictly under 500 tokens
 */
export function generateSchemaSummaryMarkdown({ enums, models }) {
  const lines = [
    "# Electa DB Schema Summary",
    "",
    "> Compact schema map (< 500 tokens). Auto-generated from `prisma/schema.prisma`.",
    "",
    "## Models",
    "",
    "| Model | Fields | Relations |",
    "|---|---|---|",
  ];

  for (const m of models) {
    let name = m.model;
    if (name === "ContestantCategoryAssignment") name = "ContestantCategory";
    if (name === "StudentRosterEntry") name = "StudentRoster";
    if (name === "ProjectSubmissionLink") name = "ProjectLink";
    if (name === "ProjectTrackTag") name = "ProjectTrack";

    const fields = m.scalarFields.slice(0, 2).join(", ") || "—";
    const rels = m.relationFields.slice(0, 2).join(", ") || "—";
    lines.push(`| **${name}** | ${fields} | ${rels} |`);
  }

  lines.push("");
  lines.push("## ER Diagram");
  lines.push("");
  lines.push("```mermaid");
  lines.push("erDiagram");

  const coreEdges = [
    "Event ||--o{ Contestant : hosts",
    "Event ||--o{ Vote : collects",
    "Event ||--o{ PaymentTransaction : logs",
    "Event ||--o{ ProjectSubmission : tracks",
    "Contestant ||--o{ Vote : receives",
    "Division ||--o{ Contestant : groups",
    "BallotSubmission ||--o{ Vote : contains",
    "ProjectSubmission ||--o{ JudgeEvaluation : review",
  ];

  for (const edge of coreEdges) {
    lines.push(`  ${edge}`);
  }

  lines.push("```");
  lines.push("");
  lines.push("## Enums");
  lines.push("");

  const keyEnums = [
    `Archetype (${enums.get("EventArchetype")?.slice(0, 3).join(", ")})`,
    `Status (${enums.get("EventPublicationStatus")?.join(", ")})`,
    `Vote (${enums.get("VoteType")?.join(", ")})`,
    `Payment (${enums.get("PaymentStatus")?.slice(0, 2).join(", ")})`,
  ].join(" | ");

  lines.push(`- **Enums**: ${keyEnums}`);
  lines.push("");
  return lines.join("\n");
}

function normalizeForComparison(str) {
  return str
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .trim();
}

export function runGenerator({ check = false, maxTokens = 500 } = {}) {
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema not found at: ${schemaPath}`);
    process.exit(1);
  }

  const rawSchema = fs.readFileSync(schemaPath, "utf8");
  const parsed = parsePrismaSchema(rawSchema);
  const markdown = generateSchemaSummaryMarkdown(parsed);
  const tokenEstimate = estimateTokenCount(markdown);

  if (check) {
    if (!fs.existsSync(outputPath)) {
      console.error(`❌ ${outputPath} does not exist. Run generation first.`);
      process.exit(1);
    }
    const existing = fs.readFileSync(outputPath, "utf8");
    const normalizedExisting = existing.replace(/\r\n/g, "\n");
    const existingTokens = estimateTokenCount(normalizedExisting);
    if (normalizeForComparison(existing) !== normalizeForComparison(markdown)) {
      console.error(`❌ Schema summary is out of sync with prisma/schema.prisma.`);
      process.exit(1);
    }
    if (existingTokens >= maxTokens) {
      console.error(
        `❌ Schema summary exceeds token budget: ${existingTokens} tokens >= ${maxTokens}`,
      );
      process.exit(1);
    }
    console.log(
      `✅ Schema summary up to date and verified: ~${existingTokens} tokens (< ${maxTokens})`,
    );
    return;
  }

  const docsDir = path.dirname(outputPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, markdown, "utf8");
  console.log(`✅ Generated ${path.relative(rootDir, outputPath)}`);
  console.log(`   - Models parsed: ${parsed.models.length}`);
  console.log(`   - Enums parsed: ${parsed.enums.size}`);
  console.log(`   - Character count: ${markdown.length}`);
  console.log(`   - Token count estimate: ~${tokenEstimate} tokens (budget < ${maxTokens})`);

  if (tokenEstimate >= maxTokens) {
    console.error(
      `❌ Error: Estimated token count (~${tokenEstimate}) meets or exceeds ${maxTokens} tokens!`,
    );
    process.exit(1);
  }
}

// Direct CLI invocation
const isDirectCall =
  process.argv[1] &&
  (process.argv[1].endsWith("generate-schema-summary.mjs") ||
    process.argv[1].includes("generate-schema-summary"));

if (isDirectCall) {
  const isCheck = process.argv.includes("--check") || process.argv.includes("--verify");
  runGenerator({ check: isCheck });
}
