"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Globe,
  ImageIcon,
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { createEventSchema, sanitizeSlug, type CreateEventInput } from "@/lib/validations/event";
import { createEventAction } from "../actions/create-event";
import { useDebouncedSlugCheck } from "../hooks/useDebouncedSlugCheck";
import { SlugAvailabilityBadge } from "./SlugAvailabilityBadge";
import { BannerAspectPreview } from "./dashboard/BannerAspectPreview";
import { cn } from "@/lib/utils";

export interface CreateEventFormProps {
  onSuccess?: (slug: string) => void;
  onCancel?: () => void;
  className?: string;
}

interface FormRawValues {
  title: string;
  slug: string;
  description: string;
  bannerUrl: string;
  startsAt: string;
  endsAt: string;
}

function getDefaultDates(): { startsAt: string; endsAt: string } {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  tomorrow.setMinutes(0, 0, 0);

  const thirtyDaysLater = new Date(tomorrow.getTime() + 30 * 24 * 60 * 60 * 1000);
  thirtyDaysLater.setMinutes(0, 0, 0);

  // Format to YYYY-MM-DDTHH:mm for datetime-local
  const formatLocal = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return {
    startsAt: formatLocal(tomorrow),
    endsAt: formatLocal(thirtyDaysLater),
  };
}

export function CreateEventForm({
  onSuccess,
  onCancel,
  className,
}: CreateEventFormProps): React.JSX.Element {
  const router = useRouter();
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultDates = getDefaultDates();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormRawValues>({
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      bannerUrl: "",
      startsAt: defaultDates.startsAt,
      endsAt: defaultDates.endsAt,
    },
    mode: "onChange",
  });

  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedBannerUrl = watch("bannerUrl");
  const watchedStartsAt = watch("startsAt");
  const watchedEndsAt = watch("endsAt");

  const slugCheck = useDebouncedSlugCheck(watchedSlug);

  // Check 1-hour temporal difference
  const startTime = watchedStartsAt ? new Date(watchedStartsAt).getTime() : 0;
  const endTime = watchedEndsAt ? new Date(watchedEndsAt).getTime() : 0;
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const isTemporalInvalid = Boolean(
    watchedStartsAt && watchedEndsAt && endTime - startTime < ONE_HOUR_MS,
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle, { shouldValidate: true });

    if (!isCustomSlug) {
      const generatedSlug = sanitizeSlug(newTitle);
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  };

  const handleResetSlugToTitle = () => {
    setIsCustomSlug(false);
    const generatedSlug = sanitizeSlug(watchedTitle || "");
    setValue("slug", generatedSlug, { shouldValidate: true });
  };

  const onSubmit = async (values: FormRawValues) => {
    setServerError(null);

    // Transform datetime-local to ISO strings
    const payload: CreateEventInput = {
      title: values.title.trim(),
      slug: values.slug.trim().toLowerCase(),
      description: values.description.trim(),
      bannerUrl: values.bannerUrl.trim(),
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
    };

    // Client-side schema parse validation
    const validation = createEventSchema.safeParse(payload);
    if (!validation.success) {
      setServerError(validation.error.issues.map((i) => i.message).join(", "));
      return;
    }

    if (slugCheck.status !== "available") {
      setServerError("Please choose an available and valid URL slug before submitting.");
      return;
    }

    try {
      const result = await createEventAction(validation.data);

      if (!result.success) {
        setServerError(result.error || "Failed to create event");
        return;
      }

      if (onSuccess) {
        onSuccess(result.data.slug);
      } else {
        router.push(`/events/${result.data.slug}/settings`);
      }
    } catch (err: unknown) {
      console.error("Submission error:", err);
      setServerError("An unexpected error occurred while creating the event.");
    }
  };

  const isSubmitDisabled =
    isSubmitting ||
    slugCheck.isChecking ||
    (Boolean(watchedSlug) && slugCheck.status !== "available") ||
    isTemporalInvalid ||
    !watchedTitle?.trim();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md sm:p-8",
        className,
      )}
    >
      {serverError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertCircle className="size-5 shrink-0 text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Event Creation Failed</p>
            <p className="mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Event Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">1. Competition Details</h2>

          {/* Title */}
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-slate-300">
              Event Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              placeholder="e.g. Miss Universe Philippines 2026"
              {...register("title", {
                required: "Event title is required",
                minLength: { value: 3, message: "Title must be at least 3 characters" },
                maxLength: { value: 120, message: "Title must not exceed 120 characters" },
              })}
              onChange={handleTitleChange}
              className={cn(
                "mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-hidden",
                errors.title && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
              )}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title.message}</p>}
          </div>

          {/* Slug & Availability Feedback */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="event-slug" className="block text-sm font-medium text-slate-300">
                Public URL Slug <span className="text-rose-400">*</span>
              </label>
              {isCustomSlug && (
                <button
                  type="button"
                  onClick={handleResetSlugToTitle}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300"
                >
                  <RefreshCw className="size-3" />
                  <span>Reset to Title</span>
                </button>
              )}
            </div>

            <div className="relative mt-1.5 flex rounded-xl border border-slate-700 bg-slate-950 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
              <span className="inline-flex items-center rounded-l-xl border-r border-slate-800 bg-slate-900/80 px-3 text-xs text-slate-400 select-none">
                <Globe className="mr-1.5 size-3.5 text-slate-500" />
                /events/
              </span>
              <input
                id="event-slug"
                type="text"
                placeholder="muph-2026"
                {...register("slug", {
                  required: "Slug is required",
                })}
                onChange={(e) => {
                  setIsCustomSlug(true);
                  setValue("slug", e.target.value.toLowerCase().trim(), {
                    shouldValidate: true,
                  });
                }}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden"
              />
            </div>

            {/* Slug status pill */}
            <div className="mt-2 flex items-center gap-2">
              <SlugAvailabilityBadge status={slugCheck.status} message={slugCheck.message} />
            </div>

            {errors.slug && <p className="mt-1 text-xs text-rose-400">{errors.slug.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-slate-300">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="event-description"
              rows={4}
              placeholder="Describe the competition, objectives, and special guidelines for voters..."
              {...register("description", {
                required: "Description is required",
                minLength: { value: 10, message: "Description must be at least 10 characters" },
              })}
              className={cn(
                "mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-hidden",
                errors.description && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
              )}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-400">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Banner Configuration */}
        <div className="space-y-4 border-t border-slate-800/80 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-white">2. Visual Branding</h2>
            <p className="mt-1 text-xs text-slate-400">
              Provide a high-resolution banner image URL (16:9 recommended, min 1200x675px).
            </p>
          </div>

          <div>
            <label htmlFor="event-banner" className="block text-sm font-medium text-slate-300">
              Banner Image URL <span className="text-rose-400">*</span>
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <ImageIcon className="size-4 text-slate-500" />
              </div>
              <input
                id="event-banner"
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                {...register("bannerUrl", {
                  required: "Banner image URL is required",
                })}
                className={cn(
                  "w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-hidden",
                  errors.bannerUrl && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
                )}
              />
            </div>
            {errors.bannerUrl && (
              <p className="mt-1 text-xs text-rose-400">{errors.bannerUrl.message}</p>
            )}
          </div>

          {/* Live Preview Card */}
          <BannerAspectPreview
            imageUrl={watchedBannerUrl}
            title={watchedTitle || "Event Banner Preview"}
          />
        </div>

        {/* Schedule & Operational Window */}
        <div className="space-y-4 border-t border-slate-800/80 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-white">3. Operational Schedule</h2>
            <p className="mt-1 text-xs text-slate-400">
              Configure when the competition voting window opens and closes (must be at least 1 hour
              duration).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Start Time */}
            <div>
              <label htmlFor="event-starts-at" className="block text-sm font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-violet-400" />
                  <span>Voting Starts At</span> <span className="text-rose-400">*</span>
                </span>
              </label>
              <input
                id="event-starts-at"
                type="datetime-local"
                {...register("startsAt", {
                  required: "Start date is required",
                })}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-hidden"
              />
            </div>

            {/* End Time */}
            <div>
              <label htmlFor="event-ends-at" className="block text-sm font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-violet-400" />
                  <span>Voting Ends At</span> <span className="text-rose-400">*</span>
                </span>
              </label>
              <input
                id="event-ends-at"
                type="datetime-local"
                {...register("endsAt", {
                  required: "End date is required",
                })}
                className={cn(
                  "mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-hidden",
                  isTemporalInvalid && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
                )}
              />
            </div>
          </div>

          {isTemporalInvalid && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>Event end time must be at least 1 hour after the start time.</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col-reverse items-center justify-end gap-3 border-t border-slate-800/80 pt-6 sm:flex-row">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white sm:w-auto"
            >
              Cancel
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-2.5 text-center text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white sm:w-auto"
            >
              Cancel
            </Link>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={cn(
              "inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500 focus:ring-2 focus:ring-violet-400 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Creating Event...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                <span>Create Event</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
