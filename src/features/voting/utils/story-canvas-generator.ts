import type { StoryCardPayload, StoryGeneratorResult } from "../types/story";
import { generateVotingQrCode } from "./qr-generator";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image from: ${src}`));
    img.src = src;
  });
}

export async function generateStoryCard(payload: StoryCardPayload): Promise<StoryGeneratorResult> {
  const width = 1080;
  const height = 1920;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not acquire 2D canvas context.");
  }

  const theme = payload.theme || "midnight";

  // 1. Base Background Fill
  if (theme === "coronation") {
    ctx.fillStyle = "#1e140a";
  } else if (theme === "opal") {
    ctx.fillStyle = "#0f172a";
  } else {
    ctx.fillStyle = "#020617";
  }
  ctx.fillRect(0, 0, width, height);

  // 2. Candidate Background Photo (Top 65% of screen)
  if (payload.candidateAvatarUrl) {
    try {
      const avatarImg = await loadImage(payload.candidateAvatarUrl);
      // Cover fit inside top portrait area (0 to 1350px)
      const targetHeight = 1350;
      const imgRatio = avatarImg.width / avatarImg.height;
      const targetRatio = width / targetHeight;

      let drawWidth = width;
      let drawHeight = targetHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > targetRatio) {
        drawWidth = targetHeight * imgRatio;
        offsetX = (width - drawWidth) / 2;
      } else {
        drawHeight = width / imgRatio;
        offsetY = (targetHeight - drawHeight) / 2;
      }

      ctx.drawImage(avatarImg, offsetX, offsetY, drawWidth, drawHeight);
    } catch {
      // Fallback geometric abstract background if CORS or image loading fails
      const fallbackGrad = ctx.createLinearGradient(0, 0, width, 1350);
      fallbackGrad.addColorStop(0, "#0284c7");
      fallbackGrad.addColorStop(1, "#020617");
      ctx.fillStyle = fallbackGrad;
      ctx.fillRect(0, 0, width, 1350);
    }
  }

  // 3. High-Contrast Gradient Scrim Overlays
  // Top header scrim
  const topScrim = ctx.createLinearGradient(0, 0, 0, 450);
  topScrim.addColorStop(0, "rgba(2, 6, 23, 0.92)");
  topScrim.addColorStop(0.6, "rgba(2, 6, 23, 0.5)");
  topScrim.addColorStop(1, "rgba(2, 6, 23, 0)");
  ctx.fillStyle = topScrim;
  ctx.fillRect(0, 0, width, 450);

  // Bottom content scrim (covering bottom 55% for rock-solid contrast)
  const bottomScrim = ctx.createLinearGradient(0, 800, 0, height);
  bottomScrim.addColorStop(0, "rgba(2, 6, 23, 0)");
  bottomScrim.addColorStop(0.35, "rgba(2, 6, 23, 0.85)");
  bottomScrim.addColorStop(0.6, "#020617");
  bottomScrim.addColorStop(1, "#020617");
  ctx.fillStyle = bottomScrim;
  ctx.fillRect(0, 800, width, height - 800);

  // 4. Header: Brand Bar & Event Title
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("VOTESPHERE • OFFICIAL BALLOT VERIFIED", width / 2, 110);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 48px sans-serif";
  const eventTitleUpper = payload.eventTitle.toUpperCase();
  ctx.fillText(
    eventTitleUpper.length > 32 ? `${eventTitleUpper.slice(0, 30)}...` : eventTitleUpper,
    width / 2,
    180,
  );

  if (payload.divisionName || payload.categoryName) {
    const subtitle = [payload.divisionName, payload.categoryName].filter(Boolean).join(" • ");
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 24px sans-serif";
    ctx.fillText(subtitle.toUpperCase(), width / 2, 225);
  }

  // 5. "I VOTED!" Badge
  ctx.fillStyle = theme === "coronation" ? "#f59e0b" : "#0284c7";
  ctx.fillRect(width / 2 - 180, 940, 360, 64);

  ctx.fillStyle = theme === "coronation" ? "#020617" : "#ffffff";
  ctx.font = "900 32px sans-serif";
  ctx.fillText("⭐ I VOTED FOR ⭐", width / 2, 984);

  // 6. Contestant Number & Name
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 36px monospace";
  ctx.fillText(`CONTESTANT #${String(payload.candidateNumber).padStart(2, "0")}`, width / 2, 1070);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 64px sans-serif";
  const candidateName = payload.candidateName;
  ctx.fillText(
    candidateName.length > 22 ? `${candidateName.slice(0, 20)}...` : candidateName,
    width / 2,
    1150,
  );

  // 7. Dynamic QR Code Box
  try {
    const qrDataUrl = await generateVotingQrCode(payload.votingUrl);
    const qrImg = await loadImage(qrDataUrl);

    const qrSize = 340;
    const qrX = (width - qrSize) / 2;
    const qrY = 1260;

    // QR Code Container background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

    // Border around QR container
    ctx.strokeStyle = theme === "coronation" ? "#f59e0b" : "#0284c7";
    ctx.lineWidth = 6;
    ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (err) {
    console.error("Failed to render QR on canvas:", err);
  }

  // 8. Footer CTA & Instructions
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 32px sans-serif";
  ctx.fillText("SCAN OR VISIT TO CAST YOUR VOTE", width / 2, 1710);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 22px monospace";
  ctx.fillText("electa.app", width / 2, 1760);

  // 9. Export to Data URL and Blob
  const dataUrl = canvas.toDataURL("image/png", 1.0);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Canvas blob conversion failed."));
      },
      "image/png",
      1.0,
    );
  });

  const fileName = `${payload.eventSlug}-candidate-${payload.candidateNumber}-story.png`;

  return {
    dataUrl,
    blob,
    fileName,
  };
}
