import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getApiContracts } from "../src/lib/api/contracts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "docs", "api-contracts.json");

export function exportApiContracts(): void {
  const contracts = getApiContracts();
  const payload = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    totalContracts: contracts.length,
    contracts,
  };

  const docsDir = path.dirname(outputPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(
    `✅ Exported ${contracts.length} API route contracts to ${path.relative(rootDir, outputPath)}`,
  );
}

// Direct invocation
exportApiContracts();
