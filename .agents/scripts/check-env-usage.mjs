/**
 * check-env-usage.mjs
 *
 * PostToolUse hook — scans the just-written file for raw process.env usage
 * that bypasses src/env.ts. Enforces VoteSphere Constitution §IV.
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

process.stdin.on("end", () => {
  try {
    const data = input.trim() ? JSON.parse(input) : {};
    const workspaceRoot =
      data.workspacePaths && data.workspacePaths[0] ? data.workspacePaths[0] : process.cwd();

    let targetFile = data.toolCall?.args?.TargetFile;

    // Only check .ts and .tsx files
    if (!targetFile) {
      return;
    }

    if (!isAbsolute(targetFile)) {
      targetFile = resolve(workspaceRoot, targetFile);
    }

    const ext = extname(targetFile);
    if (![".ts", ".tsx"].includes(ext)) {
      return;
    }

    // Skip generated files and the env.ts file itself
    const relPath = relative(workspaceRoot, targetFile).replace(/\\/g, "/");
    const SKIP_PATTERNS = [
      "src/generated/",
      "src/env.ts",
      "node_modules/",
      ".next/",
      ".agents/",
      ".specify/",
    ];

    if (SKIP_PATTERNS.some((p) => relPath.startsWith(p))) {
      return;
    }

    if (!existsSync(targetFile)) {
      return;
    }

    const content = readFileSync(targetFile, "utf-8");
    const lines = content.split("\n");

    // Find all process.env.VAR_NAME usages
    const RAW_ENV_PATTERN = /process\.env\.([A-Z][A-Z0-9_]*)/g;
    const violations = [];

    for (const [idx, line] of lines.entries()) {
      // Skip lines with the ignore comment
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

    if (violations.length === 0) {
      return;
    }

    // Load src/env.ts to check which keys are registered
    const envFilePath = resolve(workspaceRoot, "src", "env.ts");
    let registeredKeys = new Set();

    if (existsSync(envFilePath)) {
      const envContent = readFileSync(envFilePath, "utf-8");
      // Extract keys from the env schema — look for quoted string keys followed by : z.
      const KEY_PATTERN = /["']([A-Z][A-Z0-9_]*)["']\s*:/g;
      let keyMatch;
      while ((keyMatch = KEY_PATTERN.exec(envContent)) !== null) {
        registeredKeys.add(keyMatch[1]);
      }
    }

    // Build violation report
    const lines_output = ["", "⚠️  ENV VALIDATOR — Constitution §IV", `   File: ${relPath}`, ""];

    let hasUnregistered = false;

    for (const v of violations) {
      const isRegistered = registeredKeys.has(v.varName);

      if (isRegistered) {
        lines_output.push(`   ⚠️  Wrong access (registered but via process.env directly)`);
      } else {
        lines_output.push(`   🔴 UNREGISTERED: process.env.${v.varName}`);
        hasUnregistered = true;
      }

      lines_output.push(`   Line ${v.lineNumber}: ${v.lineContent}`);
      lines_output.push(
        `   Fix: Import from "@/env" → import { env } from "@/env"; → env.${v.varName}`,
      );

      if (!isRegistered) {
        const needsPublic = v.varName.startsWith("NEXT_PUBLIC_");
        lines_output.push(
          `   Also: Register in src/env.ts under ${needsPublic ? '"client"' : '"server"'} schema:`,
        );
        lines_output.push(`          ${v.varName}: z.string().min(1),`);
        lines_output.push(`   Also: Document in .env.example`);
      }

      lines_output.push("");
    }

    if (hasUnregistered) {
      lines_output.push("   Run /skill:env-validator for a full project scan.");
    }

    process.stderr.write(lines_output.join("\n") + "\n");
  } catch {
    // Never crash — silently ignore payload parse errors
  } finally {
    // PostToolUse contract: always write a valid JSON object to stdout
    process.stdout.write(JSON.stringify({}) + "\n");
  }
});
