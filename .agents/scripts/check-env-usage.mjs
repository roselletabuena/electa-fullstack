/**
 * check-env-usage.mjs
 *
 * Dual-mode Environment Variable Validator:
 * 1. CLI / CI runner: Scans source files for raw process.env usage that bypasses src/env.ts.
 * 2. PostToolUse hook: Reads JSON hook payload from stdin and checks the TargetFile.
 *
 * Enforces Electa Constitution §IV:
 * "Environment secrets MUST NEVER be accessed via raw process.env.* directly; access MUST go through src/env.ts."
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { extname, isAbsolute, resolve, relative, join } from "node:path";

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
    lines.push(`   ⚠️  Wrong access (registered in src/env.ts but accessed via raw process.env)`);
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

function getAllSourceFiles(dir, workspaceRoot) {
  const results = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const rel = relative(workspaceRoot, fullPath).replace(/\\/g, "/");
      if (
        !rel.startsWith("node_modules") &&
        !rel.startsWith(".next") &&
        !rel.startsWith("src/generated") &&
        !rel.startsWith(".specify") &&
        !rel.startsWith(".agents")
      ) {
        results.push(...getAllSourceFiles(fullPath, workspaceRoot));
      }
    } else if (entry.isFile() && shouldCheckFile(fullPath, workspaceRoot)) {
      results.push(fullPath);
    }
  }
  return results;
}

export function runFullScan(workspaceRoot = process.cwd()) {
  const srcDir = resolve(workspaceRoot, "src");
  const files = getAllSourceFiles(srcDir, workspaceRoot);
  const registeredKeys = loadRegisteredEnvKeys(workspaceRoot);
  const allViolations = [];

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const violations = findRawEnvViolations(content);
    if (violations.length > 0) {
      const relPath = relative(workspaceRoot, file).replace(/\\/g, "/");
      allViolations.push({ relPath, violations });
    }
  }

  if (allViolations.length === 0) {
    process.stdout.write(
      `✅ Environment check passed (Constitution §IV): 0 raw process.env bypasses across ${files.length} source files.\n`,
    );
    return true;
  }

  process.stderr.write(
    `❌ Environment check failed (Constitution §IV): Found ${allViolations.length} file(s) with raw process.env usage.\n`,
  );
  for (const item of allViolations) {
    process.stderr.write(formatViolationReport(item.relPath, item.violations, registeredKeys));
  }
  return false;
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

// Entrypoint determination: CLI scan vs. Hook stdin mode
const args = process.argv.slice(2);
const isHookMode = args.includes("--hook");
const isScanMode =
  args.includes("--scan") ||
  args.includes("--all") ||
  (!isHookMode && process.stdin.isTTY) ||
  (!isHookMode && args.length === 0);

if (isScanMode) {
  const success = runFullScan(process.cwd());
  process.exit(success ? 0 : 1);
} else {
  let input = "";
  process.stdin.setEncoding("utf-8");

  process.stdin.on("data", (chunk) => {
    input += chunk;
  });

  process.stdin.on("end", () => {
    handleStdinEnd(input);
  });
}
