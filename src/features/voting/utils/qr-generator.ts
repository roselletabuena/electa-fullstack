import QRCode from "qrcode";

export async function generateVotingQrCode(votingUrl: string): Promise<string> {
  if (!votingUrl || !votingUrl.trim()) {
    throw new Error("A valid non-empty voting URL is required to generate a QR code.");
  }

  return QRCode.toDataURL(votingUrl.trim(), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  });
}
