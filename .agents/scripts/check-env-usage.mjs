/**
 * check-env-usage.mjs
 *
 * PostToolUse hook — scans the just-written file for raw process.env usage
 * that bypasses src/env.ts. Enforces Electa Constitution §IV.
 *
 * Reads the hook payload from stdin (same contract as autofix-lint.mjs).
 * Writes a JSON object to stdout as required by the PostToolUse contract.
 * Any violations are printed to stderr so the agent sees them as warnings.
 */

import { readFileSync, existsSync } from "node:fs";
import { extname, isAbsolute, resolve, relative } from "node:path";

let input = "";
process.stdin.setEncoding("utf-8");

process.stdin.on("data", (chunk) => {
  input += chunk;
});

function shouldCheckFile(targetFile, workspaceRoot) {
  if (!targetFile) return false;

  const resolved = isAbsolute(targetFile) ? targetFile : resolve(workspaceRoot, targetFile);
  const ext = extname(resolved);
  if (![".ts", ".tsx"].includes(ext)) return false;

  const relPath = relative(workspaceRoot, resolved).replace(/\\/g, "/");
  const SKIP_PATTERNS = [
    "src/generated/",
    "src/env.ts",
    "node_modules/",
    ".next/",
    ".agents/",
    ".specify/",
  ];

  if (SKIP_PATTERNS.some((p) => relPath.startsWith(p))) return false;
  return existsSync(resolved);
}

function findRawEnvViolations(content) {
  const lines = content.split("\n");
  const RAW_ENV_PATTERN = /process\.env\.([A-Z][A-Z0-9_]*)/g;
  const violations = [];

  for (const [idx, line] of lines.entries()) {
    if (line.includes("// env-validator-ignore")) continue;

    let match;
    RAW_ENV_PATTERN.lastIndex = 0;
    while ((match = RAW_ENV_PATTERN.exec(line)) !== null) {
      violations.push({
        varName: match[1],
        lineNumber: idx + 1,
        lineContent: line.trim(),
      });
    }
  }

  return violations;
}

function loadRegisteredEnvKeys(workspaceRoot) {
  const envFilePath = resolve(workspaceRoot, "src", "env.ts");
  const registeredKeys = new Set();

  if (!existsSync(envFilePath)) return registeredKeys;

  const envContent = readFileSync(envFilePath, "utf-8");
  const KEY_PATTERN = /["']([A-Z][A-Z0-9_]*)["']\s*:/g;
  let keyMatch;
  while ((keyMatch = KEY_PATTERN.exec(envContent)) !== null) {
    registeredKeys.add(keyMatch[1]);
  }

  return registeredKeys;
}

function formatViolationItem(v, isRegistered) {
  const lines = [];
  if (isRegistered) {
    lines.push(`   ⚠️  Wrong access (registered but via process.env directly)`);
  } else {
    lines.push(`   🔴 UNREGISTERED: process.env.${v.varName}`);
  }

  lines.push(`   Line ${v.lineNumber}: ${v.lineContent}`);
  lines.push(`   Fix: Import from "@/env" → import { env } from "@/env"; → env.${v.varName}`);

  if (!isRegistered) {
    const needsPublic = v.varName.startsWith("NEXT_PUBLIC_");
    lines.push(
      `   Also: Register in src/env.ts under ${needsPublic ? '"client"' : '"server"'} schema:`,
      `          ${v.varName}: z.string().min(1),`,
      `   Also: Document in .env.example`,
    );
  }

  lines.push("");
  return lines;
}

function formatViolationReport(relPath, violations, registeredKeys) {
  const linesOutput = ["", "⚠️  ENV VALIDATOR — Constitution §IV", `   File: ${relPath}`, ""];
  let hasUnregistered = false;

  for (const v of violations) {
    const isRegistered = registeredKeys.has(v.varName);
    if (!isRegistered) hasUnregistered = true;
    linesOutput.push(...formatViolationItem(v, isRegistered));
  }

  if (hasUnregistered) {
    linesOutput.push("   Run /skill:env-validator for a full project scan.");
  }

  return linesOutput.join("\n") + "\n";
}

function handleStdinEnd(rawInput) {
  try {
    const data = rawInput.trim() ? JSON.parse(rawInput) : {};
    const workspaceRoot = data.workspacePaths?.[0] ?? process.cwd();
    const rawTarget = data.toolCall?.args?.TargetFile;

    if (!shouldCheckFile(rawTarget, workspaceRoot)) return;

    const targetFile = isAbsolute(rawTarget) ? rawTarget : resolve(workspaceRoot, rawTarget);
    const content = readFileSync(targetFile, "utf-8");
    const violations = findRawEnvViolations(content);
    if (violations.length === 0) return;

    const registeredKeys = loadRegisteredEnvKeys(workspaceRoot);
    const relPath = relative(workspaceRoot, targetFile).replace(/\\/g, "/");
    process.stderr.write(formatViolationReport(relPath, violations, registeredKeys));
  } catch {
    // Never crash — silently ignore payload parse errors
  } finally {
    process.stdout.write(JSON.stringify({}) + "\n");
  }
}

process.stdin.on("end", () => {
  handleStdinEnd(input);
});
