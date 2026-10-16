#!/usr/bin/env node

/**
 * agent-verify.mjs
 *
 * Unified Agent Verification CLI (`npm run agent:verify`)
 *
 * Enforces Electa Constitution Quality Gates in sequence:
 * Gate 1: Environment Variable Validation (Constitution §IV)
 * Gate 2: TypeScript Strict Typecheck (Constitution §I)
 * Gate 3: ESLint Static Analysis (Constitution §I, §V)
 * Gate 4: Vitest Unit Testing (Constitution §VI)
 *
 * Features:
 * - Single exit-coded process (exit 0 on all pass, fast-fail with non-zero code on first failure).
 * - Actionable failure diagnostics without verbose npm stack noise.
 * - Supports `--fast` / `--changed` for sub-second targeted feedback loops.
 * - Cross-platform compatible (Windows PowerShell, cmd, bash, zsh).
 */

import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";

const workspaceRoot = process.cwd();
const args = process.argv.slice(2);
const isFastMode = args.includes("--fast") || args.includes("--changed");

const GATES = [
  {
    id: "env",
    name: "Environment Variable Validation (Constitution §IV)",
    command: "node",
    args: [".agents/scripts/check-env-usage.mjs", "--scan"],
    description: "Verifies zero raw process.env bypasses outside src/env.ts",
  },
  {
    id: "constitution",
    name: "Constitution & Next.js 16 Boundary Validation (Constitution §I, §II)",
    command: "node",
    args: [".agents/scripts/check-constitution.mjs", "--scan"],
    description: "Verifies zero forbidden any, non-null assertions, and Next.js 16 async request API awaiting",
  },
  {
    id: "typecheck",
    name: "TypeScript Strict Typecheck (Constitution §I)",
    command: "npx",
    args: ["tsc", "--noEmit"],
    description: "Verifies strict mode types, interfaces, and zero non-null assertions",
  },
  {
    id: "lint",
    name: "ESLint Static Analysis (Constitution §I, §V)",
    command: "npx",
    args: ["eslint", "src"],
    description: "Enforces code style, React hooks rules, and zero warnings/errors",
  },
  {
    id: "test",
    name: isFastMode
      ? "Vitest Incremental Tests (vitest related --run)"
      : "Vitest Unit Test Suites (Constitution §VI)",
    command: "npx",
    args: isFastMode
      ? ["vitest", "related", "--run"]
      : ["vitest", "run"],
    description: isFastMode
      ? "Runs targeted unit tests covering modified source files (< 3s)"
      : "Executes all Vitest unit and integration test suites",
  },
];

function formatDuration(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}

function runCommand(gate) {
  return new Promise((resolveResult) => {
    const startTime = performance.now();
    let stdoutBuffer = "";
    let stderrBuffer = "";

    const child = spawn(gate.command, gate.args, {
      cwd: workspaceRoot,
      env: { ...process.env, FORCE_COLOR: "1" },
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (chunk) => {
      stdoutBuffer += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderrBuffer += chunk.toString();
    });

    child.on("close", (code) => {
      const durationMs = performance.now() - startTime;
      resolveResult({
        code: code ?? 1,
        stdout: stdoutBuffer,
        stderr: stderrBuffer,
        durationMs,
      });
    });

    child.on("error", (err) => {
      const durationMs = performance.now() - startTime;
      resolveResult({
        code: 1,
        stdout: stdoutBuffer,
        stderr: `${stderrBuffer}\nProcess error: ${err.message}`,
        durationMs,
      });
    });
  });
}

async function main() {
  console.log("======================================================================");
  console.log("⚡ Electa Unified Agent Verification Gate (agent:verify)");
  if (isFastMode) {
    console.log("🚀 Mode: FAST / CHANGED (running related tests only)");
  }
  console.log("======================================================================\n");

  const suiteStartTime = performance.now();

  for (let idx = 0; idx < GATES.length; idx++) {
    const gate = GATES[idx];
    const stepNumber = `[${idx + 1}/${GATES.length}]`;

    process.stdout.write(`${stepNumber} ⏳ Running ${gate.name}...\n`);

    const result = await runCommand(gate);

    if (result.code !== 0) {
      console.log(`\n======================================================================`);
      console.error(`❌ VERIFICATION FAILED AT GATE ${stepNumber}: ${gate.name}`);
      console.log(`----------------------------------------------------------------------`);
      
      const errorOutput = (result.stderr.trim() || result.stdout.trim());
      // Clean display of concise diagnostics
      console.error(errorOutput);
      
      console.log(`----------------------------------------------------------------------`);
      console.error(`⏱️  Failed after ${formatDuration(result.durationMs)} (fast-fail enabled)`);
      console.log(`======================================================================\n`);
      process.exit(result.code);
    }

    // Print concise success summary
    const duration = formatDuration(result.durationMs);
    console.log(`${stepNumber} ✅ PASSED (${duration})\n`);
  }

  const totalDuration = formatDuration(performance.now() - suiteStartTime);
  console.log("======================================================================");
  console.log(`🎉 ALL ${GATES.length} QUALITY GATES PASSED (Total: ${totalDuration})`);
  console.log("======================================================================\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Unexpected error in agent-verify runner:", err);
  process.exit(1);
});
