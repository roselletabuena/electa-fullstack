import type { EmbedPlatform } from "../types";

export interface ParsedVideoEmbed {
  platform: EmbedPlatform;
  embedId: string;
  embedUrl: string;
}

const YOUTUBE_REGEX = /(?:youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{11})/i;
const TIKTOK_VIDEO_REGEX = /tiktok\.com\/@[^/]+\/video\/(\d+)/i;
const TIKTOK_VM_REGEX = /vm\.tiktok\.com\/([a-z0-9]+)/i;
const INSTAGRAM_REGEX = /instagram\.com\/(?:reel|p)\/([\w-]+)/i;
const FACEBOOK_REEL_REGEX = /facebook\.com\/reel\/(\d+)/i;
const FACEBOOK_WATCH_REGEX = /facebook\.com\/watch\/\?v=(\d+)/i;
const FACEBOOK_VIDEO_REGEX = /facebook\.com\/[^/]+\/videos\/(\d+)/i;

export function parseVideoEmbedUrl(rawUrl: string): ParsedVideoEmbed | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();

  // 1. YouTube (Shorts, Watch, Shortlink)
  const ytShortsMatch = YOUTUBE_REGEX.exec(trimmed);
  if (ytShortsMatch?.[1]) {
    const id = ytShortsMatch[1];
    return {
      platform: "YOUTUBE",
      embedId: id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0&modestbranding=1`,
    };
  }

  // 2. TikTok
  const tiktokMatch = TIKTOK_VIDEO_REGEX.exec(trimmed) ?? TIKTOK_VM_REGEX.exec(trimmed);
  if (tiktokMatch?.[1]) {
    const id = tiktokMatch[1];
    return {
      platform: "TIKTOK",
      embedId: id,
      embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
    };
  }

  // 3. Instagram Reels / Posts
  const igMatch = INSTAGRAM_REGEX.exec(trimmed);
  if (igMatch?.[1]) {
    const id = igMatch[1];
    return {
      platform: "INSTAGRAM",
      embedId: id,
      embedUrl: `https://www.instagram.com/p/${id}/embed`,
    };
  }

  // 4. Facebook Videos / Reels
  const fbReelMatch = FACEBOOK_REEL_REGEX.exec(trimmed);
  const fbWatchMatch = FACEBOOK_WATCH_REGEX.exec(trimmed);
  const fbVideoMatch = FACEBOOK_VIDEO_REGEX.exec(trimmed);
  const fbId = fbReelMatch?.[1] ?? fbWatchMatch?.[1] ?? fbVideoMatch?.[1];
  if (fbId) {
    return {
      platform: "FACEBOOK",
      embedId: fbId,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0`,
    };
  }

  return null;
}
