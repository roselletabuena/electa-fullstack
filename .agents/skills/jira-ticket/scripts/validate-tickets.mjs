#!/usr/bin/env node

/**
 * Jira Ticket Validator & Plan Formatter for Electa
 *
 * Validates ticket title formats, dependency graphs, and prepares
 * payloads for Atlassian Jira creation & link operations.
 *
 * Title Format Enforced:
 *   Frontend: FE: <major>.<minor> <Title of the ticket> (e.g., "FE: 1.1 Contestant Grid UI")
 *   Backend:  BE: <major>.<minor> <Title of the ticket> (e.g., "BE: 1.2 Contestants API & Prisma Service")
 *
 * Link Types Supported:
 *   - Blocks: Prerequisite tickets that block downstream items, with explicit blocking reasons.
 *   - Relates: Contextual or shared-component tickets, with explicit relationship reasons.
 *
 * Usage:
 *   node validate-tickets.mjs <path-to-tickets.json>
 *   node validate-tickets.mjs --demo
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const TITLE_REGEX = /^(FE|BE):\s+(\d+)\.(\d+)\s+([^\r\n]+)$/;

/**
 * Normalizes a link reference to an object with target and reason
 */
function normalizeLink(link) {
  if (typeof link === "string") {
    return { target: link, reason: "Prerequisite dependency" };
  }
  if (link && typeof link === "object") {
    return {
      target: link.target || link.id || link.key || "",
      reason: link.reason || "Prerequisite dependency",
    };
  }
  return { target: "", reason: "" };
}

/**
 * Validates a single ticket object
 */
export function validateTicket(ticket, index = 0) {
  const errors = [];

  if (!ticket || typeof ticket !== "object") {
    return { valid: false, errors: [`Ticket #${index + 1} must be an object`] };
  }

  // 1. Summary / Title validation
  if (!ticket.summary || typeof ticket.summary !== "string") {
    errors.push(`Ticket #${index + 1} is missing a summary/title string`);
  } else {
    const match = ticket.summary.match(TITLE_REGEX);
    if (!match) {
      errors.push(
        `Ticket #${index + 1} summary "${ticket.summary}" violates title format. Expected "FE: <major>.<minor> <Title>" or "BE: <major>.<minor> <Title>" (e.g., "FE: 1.1 Landing Hero Component", "BE: 1.2 Auth Route Handler")`
      );
    }
  }

  // 2. Issue type validation
  const validTypes = ["Story", "Task", "Bug", "Epic"];
  const issueType = ticket.issueType || "Story";
  if (!validTypes.includes(issueType)) {
    errors.push(
      `Invalid issueType "${issueType}". Must be one of: ${validTypes.join(", ")}`
    );
  }

  // 3. Description validation
  if (!ticket.description || typeof ticket.description !== "string") {
    errors.push(`Ticket #${index + 1} is missing a markdown description`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a collection of tickets and their dependency & related references
 */
export function validateTicketBatch(tickets) {
  const allErrors = [];
  const idSet = new Set();

  for (const [i, t] of tickets.entries()) {
    const res = validateTicket(t, i);
    if (!res.valid) {
      allErrors.push(...res.errors);
    }
    const tempId = t.tempId || t.summary;
    if (tempId) {
      if (idSet.has(tempId)) {
        allErrors.push(`Duplicate ticket identifier/summary: "${tempId}"`);
      }
      idSet.add(tempId);
    }
  }

  // Validate dependencies (blocks / dependsOn / relatesTo)
  for (const [i, t] of tickets.entries()) {
    const checkLinks = (links, linkLabel) => {
      if (!Array.isArray(links)) return;
      for (const raw of links) {
        const link = normalizeLink(raw);
        if (!link.target) {
          allErrors.push(`Ticket #${i + 1} ("${t.summary}") has empty ${linkLabel} target`);
        } else if (!idSet.has(link.target) && !/^VS-\d+$/i.test(link.target)) {
          allErrors.push(
            `Ticket #${i + 1} ("${t.summary}") ${linkLabel} unknown ticket "${link.target}" (not in batch and not a valid Jira key)`
          );
        }
      }
    };

    checkLinks(t.dependsOn || t.isBlockedBy, "depends on");
    checkLinks(t.blocks, "blocks");
    checkLinks(t.relatesTo, "relates to");
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    count: tickets.length,
  };
}

// Demo execution if invoked directly with --demo or no args
if (process.argv[1]?.endsWith("validate-tickets.mjs")) {
  const arg = process.argv[2];

  if (arg === "--demo" || !arg) {
    const demoBatch = [
      {
        tempId: "BE-1.2",
        summary: "BE: 1.2 Contestant Query API & Prisma Integration",
        issueType: "Story",
        blocks: [
          {
            target: "FE-1.1",
            reason: "Frontend roster grid requires live GET /api/v1/contestants endpoint and TypeScript ApiResponse schema.",
          },
        ],
        relatesTo: [
          {
            target: "VS-40",
            reason: "Uses AWS S3 storage presigned URL generator for contestant avatar images.",
          },
        ],
        description: "Implements Prisma singleton queries and GET /api/v1/contestants route.",
      },
      {
        tempId: "FE-1.1",
        summary: "FE: 1.1 Contestant Cards Grid & Dynamic Category Filter",
        issueType: "Story",
        dependsOn: [
          {
            target: "BE-1.2",
            reason: "Grid hydration is blocked until the API endpoint contract is available.",
          },
        ],
        relatesTo: [
          {
            target: "VS-86",
            reason: "Shares search and filter bar primitives from Core Global Shell.",
          },
        ],
        description: "Renders accessible zero-radius contestant cards grid.",
      },
    ];

    console.log("=== Running Demo Ticket Validation ===");
    const result = validateTicketBatch(demoBatch);
    console.log(`Status: ${result.valid ? "PASSED" : "FAILED"}`);
    if (result.valid) {
      console.log(`Successfully verified ${result.count} tickets with dependency & relation links.`);
      for (const t of demoBatch) {
        console.log(`\n  ✓ ${t.summary}`);
        if (t.blocks) {
          for (const b of t.blocks) {
            const link = normalizeLink(b);
            console.log(`    ↳ BLOCKS: ${link.target} (Reason: "${link.reason}")`);
          }
        }
        if (t.dependsOn) {
          for (const d of t.dependsOn) {
            const link = normalizeLink(d);
            console.log(`    ↳ IS BLOCKED BY: ${link.target} (Reason: "${link.reason}")`);
          }
        }
        if (t.relatesTo) {
          for (const r of t.relatesTo) {
            const link = normalizeLink(r);
            console.log(`    ↳ RELATES TO: ${link.target} (Context: "${link.reason}")`);
          }
        }
      }
      console.log("");
    } else {
      console.error("Validation errors:\n" + result.errors.map((e) => ` - ${e}`).join("\n"));
      process.exit(1);
    }
  } else {
    try {
      const filePath = resolve(process.cwd(), arg);
      const raw = readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      const list = Array.isArray(data) ? data : data.tickets || [];
      const result = validateTicketBatch(list);
      if (!result.valid) {
        console.error("Validation failed:\n" + result.errors.map((e) => ` - ${e}`).join("\n"));
        process.exit(1);
      }
      console.log(`Successfully validated ${result.count} tickets from ${filePath}`);
    } catch (err) {
      console.error(`Error processing file: ${err.message}`);
      process.exit(1);
    }
  }
}
