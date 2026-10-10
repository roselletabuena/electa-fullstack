#!/usr/bin/env node

/**
 * Git Local & Remote Branch Cleanup Utility
 *
 * Audits and safely deletes merged and stale git branches locally and on the remote.
 *
 * Usage:
 *   node cleanup-branches.mjs [--dry-run] [--local] [--remote] [--all] [--target main] [--force]
 *
 * Examples:
 *   node cleanup-branches.mjs --dry-run
 *   node cleanup-branches.mjs --local
 *   node cleanup-branches.mjs --remote
 *   node cleanup-branches.mjs --all
 */

import { execSync } from "node:child_process";

// Protected branches that must NEVER be deleted under any circumstances
const PROTECTED_BRANCHES = new Set([
  "main",
  "master",
  "develop",
  "dev",
  "staging",
  "production",
  "prod",
]);

function runGit(command, { silent = false } = {}) {
  try {
    return execSync(command, {
      encoding: "utf-8",
      stdio: silent ? ["pipe", "pipe", "pipe"] : ["pipe", "pipe", "inherit"],
    }).trim();
  } catch (err) {
    if (silent) return null;
    throw err;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    local: false,
    remote: false,
    all: false,
    force: false,
    target: "main",
    remoteName: "origin",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--local") options.local = true;
    else if (arg === "--remote") options.remote = true;
    else if (arg === "--all") options.all = true;
    else if (arg === "--force" || arg === "-f") options.force = true;
    else if (arg === "--target" && args[i + 1]) {
      options.target = args[++i];
    } else if (arg === "--remote-name" && args[i + 1]) {
      options.remoteName = args[++i];
    }
  }

  // If no action is specified, default to dry-run report
  if (!options.local && !options.remote && !options.all) {
    options.dryRun = true;
    options.all = true;
  }

  if (options.all) {
    options.local = true;
    options.remote = true;
  }

  return options;
}

function isProtected(branchName) {
  const clean = branchName.replace(/^origin\//, "").trim();
  if (PROTECTED_BRANCHES.has(clean)) return true;
  if (clean.startsWith("release/")) return true;
  return false;
}

function getCurrentBranch() {
  return runGit("git rev-parse --abbrev-ref HEAD", { silent: true });
}

function getLocalMergedBranches(targetRemoteRef) {
  const output = runGit(`git branch --merged ${targetRemoteRef}`, { silent: true });
  if (!output) return [];

  return output
    .split("\n")
    .map((line) => line.replace(/^\*/, "").trim())
    .filter((name) => name.length > 0 && !name.startsWith("(") && !isProtected(name));
}

function getRemoteMergedBranches(remoteName, targetBranch) {
  const targetRemoteRef = `${remoteName}/${targetBranch}`;
  const output = runGit(`git branch -r --merged ${targetRemoteRef}`, { silent: true });
  if (!output) return [];

  const prefix = `${remoteName}/`;
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line.startsWith(prefix)) return false;
      const stripped = line.slice(prefix.length);
      if (stripped === "HEAD" || stripped.startsWith("HEAD ->")) return false;
      if (isProtected(stripped)) return false;
      return true;
    })
    .map((line) => line.slice(prefix.length));
}

function main() {
  const options = parseArgs();
  const currentBranch = getCurrentBranch();
  const targetRemoteRef = `${options.remoteName}/${options.target}`;

  console.log("\n🧹 ==========================================");
  console.log("   ELECTA / ELECTA BRANCH CLEANUP TOOL");
  console.log("==========================================\n");

  console.log(`📌 Current active branch : \x1b[36m${currentBranch}\x1b[0m`);
  console.log(`🎯 Target base branch    : \x1b[33m${targetRemoteRef}\x1b[0m`);
  console.log(`🛡️ Mode                  : ${options.dryRun ? "\x1b[35m[DRY RUN - PREVIEW ONLY]\x1b[0m" : "\x1b[31m[EXECUTE DELETION]\x1b[0m"}\n`);

  // Step 1: Prune remote tracking references
  console.log(`📡 Fetching and pruning remote references from ${options.remoteName}...`);
  try {
    runGit(`git fetch ${options.remoteName} --prune`, { silent: true });
    console.log(`   ✓ Remote tracking branches pruned successfully.\n`);
  } catch (err) {
    console.warn(`   ⚠️ Warning: Failed to fetch/prune from remote: ${err.message}`);
  }

  // Step 2: Identify candidate local branches
  const localCandidates = getLocalMergedBranches(targetRemoteRef).filter(
    (branch) => branch !== currentBranch
  );

  // Step 3: Identify candidate remote branches
  const remoteCandidates = getRemoteMergedBranches(options.remoteName, options.target).filter(
    (branch) => branch !== currentBranch
  );

  // Report Local Branches
  console.log("📂 Local Branches Merged into " + targetRemoteRef + ":");
  if (localCandidates.length === 0) {
    console.log("   ✓ No stale local branches found.");
  } else {
    localCandidates.forEach((b) => {
      console.log(`   - \x1b[32m${b}\x1b[0m`);
    });
  }
  console.log("");

  // Report Remote Branches
  console.log(`🌐 Remote Branches on ${options.remoteName} Merged into ` + targetRemoteRef + ":");
  if (remoteCandidates.length === 0) {
    console.log("   ✓ No stale remote branches found.");
  } else {
    remoteCandidates.forEach((b) => {
      console.log(`   - \x1b[34m${options.remoteName}/${b}\x1b[0m`);
    });
  }
  console.log("");

  if (options.dryRun) {
    console.log("------------------------------------------");
    console.log("ℹ️  Dry run completed. Zero branches were modified or deleted.");
    console.log("👉 To delete local branches:   node cleanup-branches.mjs --local");
    console.log("👉 To delete remote branches:  node cleanup-branches.mjs --remote");
    console.log("👉 To delete both:             node cleanup-branches.mjs --all");
    console.log("------------------------------------------\n");
    return;
  }

  // Execution: Local Deletion
  if (options.local && localCandidates.length > 0) {
    console.log("🚀 Deleting local merged branches...");
    for (const branch of localCandidates) {
      try {
        const flag = options.force ? "-D" : "-d";
        runGit(`git branch ${flag} "${branch}"`, { silent: true });
        console.log(`   ✓ Deleted local branch: ${branch}`);
      } catch (err) {
        console.error(`   ❌ Failed to delete local branch ${branch}: ${err.message}`);
      }
    }
    console.log("");
  }

  // Execution: Remote Deletion
  if (options.remote && remoteCandidates.length > 0) {
    console.log(`🚀 Deleting remote branches on ${options.remoteName}...`);
    for (const branch of remoteCandidates) {
      try {
        runGit(`git push ${options.remoteName} --delete "${branch}"`);
        console.log(`   ✓ Deleted remote branch: ${options.remoteName}/${branch}`);
      } catch (err) {
        console.error(`   ❌ Failed to delete remote branch ${options.remoteName}/${branch}: ${err.message}`);
      }
    }
    console.log("");
  }

  console.log("✨ Cleanup completed successfully!\n");
}

main();
