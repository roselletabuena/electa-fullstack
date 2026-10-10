import { describe, it, expect } from "vitest";
import {
  buildQrPhPayload,
  generateQrCodeDataUrl,
  generateQrCodeSvg,
} from "@/features/payments/services/qrph-generator";

describe("Payments - QR Ph Payload & Generator", () => {
  it("builds a valid BSP EMVCo QR Ph payload string", () => {
    const payload = buildQrPhPayload({
      referenceNumber: "VS-TEST1234",
      amountInPhp: 250,
      merchantName: "Electa",
      city: "Manila",
    });

    expect(payload).toContain("000201010212");
    expect(payload).toContain("ph.gov.bsp.qrph");
    expect(payload).toContain("VS-TEST1234");
    expect(payload).toContain("250.00");
    expect(payload).toContain("ELECTA");
  });

  it("generates an SVG string from QR payload", async () => {
    const payload = buildQrPhPayload({
      referenceNumber: "VS-TEST-SVG",
      amountInPhp: 100,
    });

    const svg = await generateQrCodeSvg(payload);
    expect(svg).toBeDefined();
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("generates a base64 PNG data URL from QR payload", async () => {
    const payload = buildQrPhPayload({
      referenceNumber: "VS-TEST-DATAURL",
      amountInPhp: 50,
    });

    const dataUrl = await generateQrCodeDataUrl(payload);
    expect(dataUrl).toBeDefined();
    expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });
});
