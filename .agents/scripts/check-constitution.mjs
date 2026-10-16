/**
 * check-constitution.mjs
 *
 * Dual-mode Constitution Guard:
 * 1. CLI / CI runner: Scans source files for Electa Constitution violations (§I–§VI).
 * 2. PostToolUse hook: Reads JSON hook payload from stdin and checks the TargetFile.
 *
 * Enforces Electa Constitution:
 * - §I. Strict Type Safety: Prohibits `any`, `as any`, `<any>`, and non-null assertions (`!`).
 * - §II. Next.js 16 App Router Boundary Isolation:
 *        - `cookies()` and `headers()` MUST be awaited.
 *        - Route params and searchParams MUST be awaited (`Promise<{ ... }>`).
 *        - Route Handlers (`src/app/api/`) MUST return standard typed `ApiResponse<T>` envelopes.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { extname, isAbsolute, resolve, relative, join } from "node:path";

export function shouldCheckFile(targetFile, workspaceRoot) {
  if (!targetFile) return false;

  const resolved = isAbsolute(targetFile) ? targetFile : resolve(workspaceRoot, targetFile);
  const ext = extname(resolved);
  if (![".ts", ".tsx"].includes(ext)) return false;

  const relPath = relative(workspaceRoot, resolved).replace(/\\/g, "/");
  const SKIP_PATTERNS = [
    "src/generated/",
    "node_modules/",
    ".next/",
    ".agents/",
    ".specify/",
    "tests/",
    "docs/",
  ];

  if (SKIP_PATTERNS.some((p) => relPath.startsWith(p))) return false;
  return existsSync(resolved);
}

// Strip block comments, line comments, and string literals to avoid false positives
function sanitizeCodeForSyntaxChecks(line) {
  return line
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/, "")
    .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '""');
}

export function findConstitutionViolations(content, filePath = "") {
  const lines = content.split("\n");
  const violations = [];
  const normalizedPath = filePath.replace(/\\/g, "/");
  const isRouteHandler =
    normalizedPath.includes("src/app/api/") &&
    !normalizedPath.includes("src/app/api/webhooks/") &&
    normalizedPath.endsWith("route.ts");
  const isAppRouterPageOrLayout =
    normalizedPath.includes("src/app/") &&
    (normalizedPath.endsWith("page.tsx") ||
      normalizedPath.endsWith("layout.tsx") ||
      normalizedPath.endsWith("route.ts"));

  // Check 1: Route Handler typed envelope check
  if (isRouteHandler) {
    const hasRawNextResponseJson = /NextResponse\.json\s*\(/.test(content);
    const hasApiEnvelope = /\bapiSuccess\s*\(|\bapiError\s*\(/.test(content);
    if (hasRawNextResponseJson && !hasApiEnvelope) {
      violations.push({
        principle: "§II",
        type: "ROUTE_HANDLER_ENVELOPE",
        lineNumber: 1,
        lineContent: "export async function ...",
        message:
          "Route Handlers MUST return standard typed ApiResponse<T> envelopes using apiSuccess() or apiError().",
        fix: 'Import from "@/lib/api/response": return apiSuccess(data); or return apiError(message, status);',
      });
    }
  }

  let previousLineIgnored = false;
  for (const [idx, rawLine] of lines.entries()) {
    const isCurrentLineIgnored =
      rawLine.includes("// constitution-ignore") ||
      rawLine.includes("/* constitution-ignore */");

    if (isCurrentLineIgnored) {
      previousLineIgnored = true;
      continue;
    }

    if (previousLineIgnored) {
      previousLineIgnored = false;
      continue;
    }

    const cleanLine = sanitizeCodeForSyntaxChecks(rawLine);

    // Check 2: Next.js 16 request APIs must be awaited (cookies(), headers())
    const unawaitedReqApiRegex = /(?<!await\s+)\b(cookies|headers)\s*\(\s*\)/g;
    let reqApiMatch;
    while ((reqApiMatch = unawaitedReqApiRegex.exec(cleanLine)) !== null) {
      const apiName = reqApiMatch[1];
      violations.push({
        principle: "§II",
        type: "UN_AWAITED_NEXT_REQUEST_API",
        lineNumber: idx + 1,
        lineContent: rawLine.trim(),
        message: `Next.js 16 request API \`${apiName}()\` invoked without \`await\`. In Next.js 16 App Router, request APIs are asynchronous Promises.`,
        fix: `Use \`const store = await ${apiName}();\``,
      });
    }

    // Check 3: Next.js 16 App Router un-awaited params / searchParams in pages/routes
    if (isAppRouterPageOrLayout) {
      // Catch synchronous context.params.<prop> or props.params.<prop> or synchronous destructured access without await
      const syncParamsAccess = /(?:context|props)\.(params|searchParams)\.([a-zA-Z0-9_]+)/.exec(
        cleanLine,
      );
      if (syncParamsAccess) {
        const propType = syncParamsAccess[1];
        violations.push({
          principle: "§II",
          type: "UN_AWAITED_PARAMS_ACCESS",
          lineNumber: idx + 1,
          lineContent: rawLine.trim(),
          message: `Synchronous access on \`${propType}.${syncParamsAccess[2]}\` without \`await\`. In Next.js 16, \`params\` and \`searchParams\` are Promises.`,
          fix: `Await the params object before accessing properties: \`const { ${syncParamsAccess[2]} } = await context.params;\``,
        });
      }
    }

    // Check 4: Prohibited `any` keyword (Constitution §I)
    // Matches `: any`, `as any`, `<any>`
    const anyRegex = /(?::\s*any\b|<any\b>|\bas\s+any\b)/g;
    let anyMatch;
    while ((anyMatch = anyRegex.exec(cleanLine)) !== null) {
      violations.push({
        principle: "§I",
        type: "PROHIBITED_ANY_TYPE",
        lineNumber: idx + 1,
        lineContent: rawLine.trim(),
        message: `Prohibited \`any\` type detected (\`${anyMatch[0].trim()}\`). TypeScript 5 strict mode is non-negotiable.`,
        fix: "Replace with `unknown` and narrow the type, or define an explicit TypeScript interface.",
      });
    }

    // Check 5: Prohibited non-null assertion operator `!` (Constitution §I)
    // Matches identifier followed by `!` and then property access, e.g. `foo!.bar` or `array![0]`
    const nonNullRegex = /\b([a-zA-Z0-9_$]+)!(?:\.|\b|\(|\[)(?!=|==)/g;
    let nonNullMatch;
    while ((nonNullMatch = nonNullRegex.exec(cleanLine)) !== null) {
      // Exclude boolean negations or common operators
      violations.push({
        principle: "§I",
        type: "PROHIBITED_NON_NULL_ASSERTION",
        lineNumber: idx + 1,
        lineContent: rawLine.trim(),
        message: `Prohibited non-null assertion \`${nonNullMatch[1]}!\` detected.`,
        fix: "Explicitly handle null/undefined conditions or use optional chaining (`?.`).",
      });
    }
  }

  return violations;
}

export function formatConstitutionReport(relPath, violations) {
  const lines = [
    "",
    "🛑 CONSTITUTION GUARD — Electa Constitution §I & §II",
    `   File: ${relPath}`,
    "",
  ];

  for (const v of violations) {
    lines.push(`   🔴 [${v.principle} - ${v.type}] Line ${v.lineNumber}: ${v.message}`);
    lines.push(`      Snippet: ${v.lineContent}`);
    lines.push(`      Fix: ${v.fix}`);
    lines.push("");
  }

  lines.push("   For complete constitutional rules, consult .specify/memory/constitution.md");
  return lines.join("\n") + "\n";
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
        !rel.startsWith("tests") &&
        !rel.startsWith(".agents") &&
        !rel.startsWith(".specify") &&
        !rel.startsWith("docs")
      ) {
        results.push(...getAllSourceFiles(fullPath, workspaceRoot));
      }
    } else if (entry.isFile() && shouldCheckFile(fullPath, workspaceRoot)) {
      results.push(fullPath);
    }
  }
  return results;
}

export function runFullConstitutionScan(workspaceRoot = process.cwd()) {
  const srcDir = resolve(workspaceRoot, "src");
  const files = getAllSourceFiles(srcDir, workspaceRoot);
  const allViolations = [];

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const violations = findConstitutionViolations(content, file);
    if (violations.length > 0) {
      const relPath = relative(workspaceRoot, file).replace(/\\/g, "/");
      allViolations.push({ relPath, violations });
    }
  }

  if (allViolations.length === 0) {
    process.stdout.write(
      `✅ Constitution check passed (§I & §II): 0 violations across ${files.length} source files.\n`,
    );
    return true;
  }

  process.stderr.write(
    `❌ Constitution check failed: Found ${allViolations.length} file(s) with constitutional violations.\n`,
  );
  for (const item of allViolations) {
    process.stderr.write(formatConstitutionReport(item.relPath, item.violations));
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
    const violations = findConstitutionViolations(content, targetFile);
    if (violations.length === 0) return;

    const relPath = relative(workspaceRoot, targetFile).replace(/\\/g, "/");
    process.stderr.write(formatConstitutionReport(relPath, violations));
  } catch {
    // Graceful execution — never throw uncaught exceptions in hooks
  } finally {
    process.stdout.write(JSON.stringify({}) + "\n");
  }
}

const isRunningDirectly =
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("check-constitution.mjs");

if (isRunningDirectly) {
  const args = process.argv.slice(2);
  const isHookMode = args.includes("--hook");
  const isScanMode =
    args.includes("--scan") ||
    args.includes("--all") ||
    (!isHookMode && process.stdin.isTTY) ||
    (!isHookMode && args.length === 0);

  if (isScanMode) {
    const success = runFullConstitutionScan(process.cwd());
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
}
