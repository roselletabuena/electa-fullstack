import { describe, it, expect } from "vitest";
import { generateVotingQrCode } from "@/features/voting/utils/qr-generator";

describe("generateVotingQrCode", () => {
  it("generates a valid data URL containing a QR code for a given voting URL", async () => {
    const votingUrl = "https://electa.app/events/miss-philippines-2026?contestantId=cand-1";
    const dataUrl = await generateVotingQrCode(votingUrl);

    expect(dataUrl).toBeDefined();
    expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("throws or handles empty URLs appropriately", async () => {
    await expect(generateVotingQrCode("")).rejects.toThrow();
  });
});
