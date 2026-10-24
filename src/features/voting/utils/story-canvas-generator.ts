import type { StoryCardPayload, StoryGeneratorResult } from "../types/story";
import { generateVotingQrCode } from "./qr-generator";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (!src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image from: ${src}`));
    img.src = src;
  });
}

async function waitForFonts(): Promise<void> {
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore if document.fonts.ready is unsupported or throws in test environments
    }
  }
}

async function drawCandidatePhoto(
  ctx: CanvasRenderingContext2D,
  avatarUrl: string | undefined,
  width: number,
  targetHeight: number,
  fallbackStart: string,
  fallbackEnd: string,
) {
  if (!avatarUrl) return;
  try {
    const avatarImg = await loadImage(avatarUrl);
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
    const fallbackGrad = ctx.createLinearGradient(0, 0, width, targetHeight);
    fallbackGrad.addColorStop(0, fallbackStart);
    fallbackGrad.addColorStop(1, fallbackEnd);
    ctx.fillStyle = fallbackGrad;
    ctx.fillRect(0, 0, width, targetHeight);
  }
}

function drawScrims(
  ctx: CanvasRenderingContext2D,
  theme: string,
  width: number,
  height: number,
  scrimBottom: string,
) {
  const isOpal = theme === "opal";
  const topScrim = ctx.createLinearGradient(0, 0, 0, 450);
  topScrim.addColorStop(0, isOpal ? "rgba(248, 250, 252, 0.95)" : "rgba(2, 6, 23, 0.92)");
  topScrim.addColorStop(0.6, isOpal ? "rgba(248, 250, 252, 0.6)" : "rgba(2, 6, 23, 0.5)");
  topScrim.addColorStop(1, isOpal ? "rgba(248, 250, 252, 0)" : "rgba(2, 6, 23, 0)");
  ctx.fillStyle = topScrim;
  ctx.fillRect(0, 0, width, 450);

  const startY = isOpal ? 750 : 800;
  const bottomScrim = ctx.createLinearGradient(0, startY, 0, height);
  bottomScrim.addColorStop(0, isOpal ? "rgba(248, 250, 252, 0)" : "rgba(2, 6, 23, 0)");
  bottomScrim.addColorStop(0.35, isOpal ? "rgba(248, 250, 252, 0.85)" : "rgba(2, 6, 23, 0.85)");
  bottomScrim.addColorStop(0.6, scrimBottom);
  bottomScrim.addColorStop(1, scrimBottom);
  ctx.fillStyle = bottomScrim;
  ctx.fillRect(0, startY, width, height - startY);
}

function getStoryFonts(isCoronation: boolean) {
  return {
    heading: isCoronation ? "'Cormorant Garamond', Georgia, serif" : "'Outfit', 'Sora', sans-serif",
    body: isCoronation ? "'Plus Jakarta Sans', sans-serif" : "'Sora', sans-serif",
    mono: isCoronation ? "'Plus Jakarta Sans', sans-serif" : "'JetBrains Mono', monospace",
  };
}

async function drawQrCodeBox(
  ctx: CanvasRenderingContext2D,
  votingUrl: string,
  width: number,
  qrBorder: string,
) {
  try {
    const qrDataUrl = await generateVotingQrCode(votingUrl);
    const qrImg = await loadImage(qrDataUrl);

    const qrSize = 340;
    const qrX = (width - qrSize) / 2;
    const qrY = 1260;

    // QR Code Container background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

    // Border around QR container
    ctx.strokeStyle = qrBorder;
    ctx.lineWidth = 6;
    ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (err) {
    console.error("Failed to render QR on canvas:", err);
  }
}

export async function generateStoryCard(payload: StoryCardPayload): Promise<StoryGeneratorResult> {
  await waitForFonts();

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

  // Palette definitions per theme
  const config = {
    midnight: {
      bg: "#020617",
      scrimBottom: "#020617",
      brandBar: "#38bdf8",
      eventTitle: "#ffffff",
      subtitle: "#94a3b8",
      badgeBg: "#0284c7",
      badgeText: "#ffffff",
      contestantNum: "#38bdf8",
      contestantName: "#ffffff",
      qrBorder: "#0284c7",
      ctaText: "#ffffff",
      footerUrl: "#94a3b8",
      fallbackGradStart: "#0284c7",
      fallbackGradEnd: "#020617",
    },
    coronation: {
      bg: "#1a0f05",
      scrimBottom: "#1a0f05",
      brandBar: "#fbbf24",
      eventTitle: "#fef3c7",
      subtitle: "#fde68a",
      badgeBg: "#f59e0b",
      badgeText: "#1a0f05",
      contestantNum: "#fbbf24",
      contestantName: "#ffffff",
      qrBorder: "#f59e0b",
      ctaText: "#fef3c7",
      footerUrl: "#fde68a",
      fallbackGradStart: "#d97706",
      fallbackGradEnd: "#1a0f05",
    },
    opal: {
      bg: "#f8fafc",
      scrimBottom: "#f8fafc",
      brandBar: "#0284c7",
      eventTitle: "#0f172a",
      subtitle: "#475569",
      badgeBg: "#0284c7",
      badgeText: "#ffffff",
      contestantNum: "#0369a1",
      contestantName: "#0f172a",
      qrBorder: "#0284c7",
      ctaText: "#0f172a",
      footerUrl: "#64748b",
      fallbackGradStart: "#38bdf8",
      fallbackGradEnd: "#f8fafc",
    },
  }[theme];

  // 1. Base Background Fill
  ctx.fillStyle = config.bg;
  ctx.fillRect(0, 0, width, height);

  // 2. Candidate Background Photo (Top 65% of screen)
  await drawCandidatePhoto(
    ctx,
    payload.candidateAvatarUrl,
    width,
    1350,
    config.fallbackGradStart,
    config.fallbackGradEnd,
  );

  // 3. High-Contrast Gradient Scrim Overlays
  drawScrims(ctx, theme, width, height, config.scrimBottom);

  const isCoronation = theme === "coronation";
  const fonts = getStoryFonts(isCoronation);

  // 4. Header: Brand Bar & Event Title
  ctx.fillStyle = config.brandBar;
  ctx.font = `bold 24px ${fonts.body}`;
  ctx.textAlign = "center";
  ctx.fillText("ELECTA • OFFICIAL BALLOT VERIFIED", width / 2, 110);

  ctx.fillStyle = config.eventTitle;
  ctx.font = isCoronation ? `700 52px ${fonts.heading}` : `900 48px ${fonts.heading}`;
  const eventTitleUpper = payload.eventTitle.toUpperCase();
  ctx.fillText(
    eventTitleUpper.length > 32 ? `${eventTitleUpper.slice(0, 30)}...` : eventTitleUpper,
    width / 2,
    180,
  );

  if (payload.divisionName || payload.categoryName) {
    const subtitle = [payload.divisionName, payload.categoryName].filter(Boolean).join(" • ");
    ctx.fillStyle = config.subtitle;
    ctx.font = `600 24px ${fonts.body}`;
    ctx.fillText(subtitle.toUpperCase(), width / 2, 225);
  }

  // 5. "I VOTED!" Badge
  ctx.fillStyle = config.badgeBg;
  ctx.fillRect(width / 2 - 190, 940, 380, 64);

  ctx.fillStyle = config.badgeText;
  ctx.font = `bold 30px ${fonts.body}`;
  ctx.fillText("⭐ I VOTED FOR ⭐", width / 2, 984);

  // 6. Contestant Number & Name
  ctx.fillStyle = config.contestantNum;
  ctx.font = `bold 32px ${fonts.mono}`;
  ctx.fillText(`CONTESTANT #${String(payload.candidateNumber).padStart(2, "0")}`, width / 2, 1070);

  ctx.fillStyle = config.contestantName;
  ctx.font = isCoronation ? `700 70px ${fonts.heading}` : `900 64px ${fonts.heading}`;
  const candidateName = payload.candidateName;
  ctx.fillText(
    candidateName.length > 22 ? `${candidateName.slice(0, 20)}...` : candidateName,
    width / 2,
    1150,
  );

  // 7. Dynamic QR Code Box
  await drawQrCodeBox(ctx, payload.votingUrl, width, config.qrBorder);

  // 8. Footer CTA & Instructions
  ctx.fillStyle = config.ctaText;
  ctx.font = `bold 30px ${fonts.body}`;
  ctx.fillText("SCAN OR VISIT TO CAST YOUR VOTE", width / 2, 1710);

  ctx.fillStyle = config.footerUrl;
  ctx.font = `bold 22px ${fonts.mono}`;
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

  const fileName = `${payload.eventSlug}-candidate-${payload.candidateNumber}-${theme}-story.png`;

  return {
    dataUrl,
    blob,
    fileName,
  };
}
