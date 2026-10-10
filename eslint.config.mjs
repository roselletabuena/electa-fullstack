import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";

/**
 * ESLint flat config for Electa.
 *
 * Uses the official Next.js 16 recommended setup:
 *  - eslint-config-next/core-web-vitals  (Next.js + React + react-hooks)
 *  - eslint-config-next/typescript       (typescript-eslint recommended)
 *  - eslint-config-prettier              (disables formatting rules that conflict with Prettier)
 *  - eslint-plugin-unicorn               (modern JS best practices)
 *
 * NOTE: Do NOT add eslint-plugin-import, eslint-plugin-jsx-a11y, or a
 * second @typescript-eslint block — they are already owned by eslint-config-next
 * and will cause plugin conflicts. See: node_modules/next/dist/docs/.../eslint.md
 */
const eslintConfig = defineConfig([
  // ─── Next.js base (React, react-hooks, @next/next, jsx-a11y) ──────────────
  ...nextVitals,

  // ─── TypeScript rules (typescript-eslint/recommended) ─────────────────────
  ...nextTs,

  // ─── Additional TypeScript conventions ────────────────────────────────────
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // ─── Unicorn (modern JS best practices) ───────────────────────────────────
  {
    plugins: { unicorn },
    rules: {
      "unicorn/no-array-for-each": "error",
      "unicorn/no-for-loop": "error",
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-string-slice": "error",
      "unicorn/prefer-ternary": "warn",
      "unicorn/throw-new-error": "error",
    },
  },

  // ─── SonarLint / SonarJS rules (code smells, bugs, cognitive complexity) ───
  sonarjs.configs.recommended,
  {
    rules: {
      // TypeScript allows explicit undefined in optional types; disable noise
      "sonarjs/no-redundant-optional": "off",
      // Math.random is used for visual effects (confetti, canvas animations)
      "sonarjs/pseudo-random": "warn",
    },
  },

  // ─── General best practices ────────────────────────────────────────────────
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
    },
  },

  // ─── Scripts & Seed (allow console logging for CLI output) ───────────────────
  {
    files: ["prisma/**/*.ts", "scripts/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },

  // ─── Prettier (must be last — disables conflicting format rules) ───────────
  prettier,

  // ─── Ignores ───────────────────────────────────────────────────────────────
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "prisma/migrations/**",
    "src/generated/**",
    ".agents/**",
  ]),
]);

export default eslintConfig;
