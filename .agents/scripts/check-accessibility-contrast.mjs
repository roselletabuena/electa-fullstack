/**
 * check-accessibility-contrast.mjs
 *
 * Dual-mode Accessibility & Color Contrast Guard:
 * 1. CLI / CI runner: Scans source files for WCAG 2.1 AA color contrast violations and naked dark-mode classes.
 * 2. PostToolUse hook: Reads JSON hook payload from stdin and checks the TargetFile.
 *
 * Enforces Electa Constitution & Design System Rules:
 * - WCAG 2.1 AA minimum contrast (4.5:1 for normal text, 3:1 for large text / UI).
 * - Light Mode (Opal Slate-50) is default; never hardcode naked dark-mode classes without dark: scoping.
 * - Low-contrast grays (text-slate-300, text-slate-400) on light backgrounds are prohibited.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { extname, isAbsolute, resolve, relative, join } from "node:path";

const DARK_CONTAINER_CLASSES = [
  "bg-black",
  "bg-[#0F172A]",
  "bg-[#0f172a]",
  "bg-[#090D16]",
  "bg-[#090d16]",
  "bg-[#0d1424]",
  "btn-primary",
  "bg-destructive",
  "bg-linear-to-",
  "bg-gradient-to-",
  "from-slate-950",
  "from-slate-900",
  "from-black",
  "via-slate-950",
  "via-slate-900",
];

const DARK_BG_SHADE_REGEX = /\bbg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|emerald|green|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:600|700|800|900|950)(?:\/\d+)?\b/;

function hasDarkContainer(classString) {
  if (DARK_BG_SHADE_REGEX.test(classString)) return true;
  return DARK_CONTAINER_CLASSES.some((cls) => classString.includes(cls));
}

const NAKED_DARK_TEXT_CLASSES = [
  "text-white",
  "text-slate-100",
  "text-slate-200",
  "text-gray-100",
  "text-gray-200",
  "text-zinc-100",
  "text-zinc-200",
];

const LOW_CONTRAST_GRAY_CLASSES = [
  "text-slate-300",
  "text-slate-400",
  "text-gray-300",
  "text-gray-400",
  "text-zinc-300",
  "text-zinc-400",
];

export function shouldCheckFile(targetFile, workspaceRoot) {
  if (!targetFile) return false;

  const resolved = isAbsolute(targetFile) ? targetFile : resolve(workspaceRoot, targetFile);
  const ext = extname(resolved);
  if (![".tsx", ".jsx"].includes(ext)) return false;

  const relPath = relative(workspaceRoot, resolved).replace(/\\/g, "/");
  const SKIP_PATTERNS = [
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


export function findContrastViolations(content) {
  const lines = content.split("\n");
  const violations = [];

  // Match class/className attributes or string templates containing Tailwind classes
  const CLASS_ATTR_REGEX = /(?:className|class)\s*=\s*(?:\{`([^`]+)`\}|"([^"]+)"|'([^']+)')/g;

  let previousLineIgnored = false;
  let enclosingDarkDepth = 0;

  for (const [idx, line] of lines.entries()) {
    const isCurrentLineIgnored =
      line.includes("// contrast-ignore") || line.includes("/* contrast-ignore */");

    if (isCurrentLineIgnored) {
      previousLineIgnored = true;
      continue;
    }

    if (previousLineIgnored) {
      previousLineIgnored = false;
      continue;
    }

    CLASS_ATTR_REGEX.lastIndex = 0;
    let attrMatch;

    while ((attrMatch = CLASS_ATTR_REGEX.exec(line)) !== null) {
      const classString = attrMatch[1] || attrMatch[2] || attrMatch[3] || "";
      const tokens = classString.split(/\s+/).filter(Boolean);
      const isDirectlyDark = hasDarkContainer(classString);

      if (isDirectlyDark && !line.includes("/>") && /<[a-zA-Z0-9]+/.test(line)) {
        enclosingDarkDepth++;
      }

      const isContainerDark = isDirectlyDark || enclosingDarkDepth > 0;

      for (const token of tokens) {
        // Skip scoped variants
        if (
          token.startsWith("dark:") ||
          token.startsWith("hover:") ||
          token.startsWith("focus:") ||
          token.startsWith("group-hover:") ||
          token.startsWith("peer-checked:")
        ) {
          continue;
        }

        // 1. Check for low-contrast gray text on light background
        if (LOW_CONTRAST_GRAY_CLASSES.includes(token) && !isContainerDark) {
          violations.push({
            type: "LOW_CONTRAST_GRAY",
            token,
            lineNumber: idx + 1,
            lineContent: line.trim(),
            message: `Low-contrast gray text \`${token}\` on light background violates WCAG 2.1 AA (< 4.5:1 ratio).`,
            recommendation: `Use \`text-slate-700\` (10.1:1 AAA), \`text-slate-600\` (5.7:1 AA), or \`text-muted-foreground\`. Pair dark mode via \`dark:${token}\`.`,
          });
        }

        // 2. Check for naked dark-mode text classes without dark container
        if (NAKED_DARK_TEXT_CLASSES.includes(token) && !isContainerDark) {
          violations.push({
            type: "NAKED_DARK_TEXT",
            token,
            lineNumber: idx + 1,
            lineContent: line.trim(),
            message: `Naked dark-mode text class \`${token}\` without \`dark:\` scoping or dark container background. Contrast on Opal Slate-50 is ~1.05:1 (< 4.5:1).`,
            recommendation: `Scope with dark variant (\`text-slate-900 dark:${token}\`) or wrap in dark container (\`bg-slate-900\`).`,
          });
        }
      }
    }

    if (line.includes("</") && enclosingDarkDepth > 0) {
      enclosingDarkDepth--;
    }
  }

  return violations;
}

export function formatContrastReport(relPath, violations) {
  const lines = [
    "",
    "⚠️  ACCESSIBILITY COLOR CONTRAST GUARD — WCAG 2.1 AA",
    `   File: ${relPath}`,
    "",
  ];

  for (const v of violations) {
    lines.push(`   🔴 [${v.type}] Line ${v.lineNumber}: ${v.message}`);
    lines.push(`      Snippet: ${v.lineContent}`);
    lines.push(`      Fix: ${v.recommendation}`);
    lines.push("");
  }

  lines.push("   For complete contrast guidelines, consult .agents/rules/accessibility-colors.md");
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

export function runFullContrastScan(workspaceRoot = process.cwd()) {
  const srcDir = resolve(workspaceRoot, "src");
  const files = getAllSourceFiles(srcDir, workspaceRoot);
  const allViolations = [];

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const violations = findContrastViolations(content);
    if (violations.length > 0) {
      const relPath = relative(workspaceRoot, file).replace(/\\/g, "/");
      allViolations.push({ relPath, violations });
    }
  }

  if (allViolations.length === 0) {
    process.stdout.write(
      `✅ Accessibility contrast check passed (WCAG 2.1 AA): 0 low-contrast defects across ${files.length} UI components.\n`,
    );
    return true;
  }

  process.stderr.write(
    `⚠️ Accessibility contrast check: Found ${allViolations.length} file(s) with potential contrast warnings.\n`,
  );
  for (const item of allViolations) {
    process.stderr.write(formatContrastReport(item.relPath, item.violations));
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
    const violations = findContrastViolations(content);
    if (violations.length === 0) return;

    const relPath = relative(workspaceRoot, targetFile).replace(/\\/g, "/");
    process.stderr.write(formatContrastReport(relPath, violations));
  } catch {
    // Graceful execution — never throw uncaught exceptions in hooks
  } finally {
    process.stdout.write(JSON.stringify({}) + "\n");
  }
}

const isRunningDirectly =
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("check-accessibility-contrast.mjs");

if (isRunningDirectly) {
  const args = process.argv.slice(2);
  const isHookMode = args.includes("--hook");
  const isScanMode =
    args.includes("--scan") ||
    args.includes("--all") ||
    (!isHookMode && process.stdin.isTTY) ||
    (!isHookMode && args.length === 0);

  if (isScanMode) {
    const success = runFullContrastScan(process.cwd());
    const isStrict = args.includes("--strict");
    process.exit(success || !isStrict ? 0 : 1);
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
