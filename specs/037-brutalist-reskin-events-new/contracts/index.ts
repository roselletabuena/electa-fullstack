import { z } from "zod";

/**
 * Slug availability status schema and type contract
 */
export const slugAvailabilityStatusSchema = z.enum([
  "idle",
  "checking",
  "available",
  "unavailable",
  "reserved",
  "invalid",
]);

export type SlugAvailabilityStatus = z.infer<typeof slugAvailabilityStatusSchema>;

/**
 * Aspect ratio preset schema and type contract
 */
export const aspectRatioPresetSchema = z.enum(["16:9", "21:9"]);
export type AspectRatioPreset = z.infer<typeof aspectRatioPresetSchema>;

/**
 * Component contracts for /events/new brutalist UI
 */
export interface SlugAvailabilityBadgeContract {
  status: SlugAvailabilityStatus;
  message?: string;
  className?: string;
}

export interface BannerAspectPreviewContract {
  imageUrl: string;
  title?: string;
  className?: string;
}

export interface CreateEventFormContract {
  onSuccess?: (slug: string) => void;
  onCancel?: () => void;
  className?: string;
}
