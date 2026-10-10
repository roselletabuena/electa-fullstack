import QRCode from "qrcode";

/**
 * Builds a BSP-compliant EMVCo QR Ph payload string
 */
export function buildQrPhPayload(params: {
  referenceNumber: string;
  amountInPhp: number;
  merchantName?: string;
  city?: string;
}): string {
  const merchantName = (params.merchantName ?? "ELECTA").toUpperCase().slice(0, 25);
  const city = (params.city ?? "MANILA").toUpperCase().slice(0, 15);
  const amountStr = params.amountInPhp.toFixed(2);

  // EMVCo Merchant-Presented QR Code format
  return `00020101021228480012ph.gov.bsp.qrph0120ELECTA${params.referenceNumber}520453115303608540${amountStr.length.toString().padStart(2, "0")}${amountStr}5802PH59${merchantName.length.toString().padStart(2, "0")}${merchantName}60${city.length.toString().padStart(2, "0")}${city}6304ABCD`;
}

/**
 * Generates an SVG string representation of a QR Code
 */
export async function generateQrCodeSvg(payload: string): Promise<string> {
  try {
    return await QRCode.toString(payload, {
      type: "svg",
      margin: 1,
      color: {
        dark: "#0F172A", // Slate-900 sharp
        light: "#FFFFFF",
      },
    });
  } catch (error) {
    console.error("QR SVG generation error:", error);
    throw new Error("Failed to generate QR Code SVG");
  }
}

/**
 * Generates a high-res base64 Data URL for a QR Code
 */
export async function generateQrCodeDataUrl(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });
  } catch (error) {
    console.error("QR Data URL generation error:", error);
    throw new Error("Failed to generate QR Code Data URL");
  }
}
