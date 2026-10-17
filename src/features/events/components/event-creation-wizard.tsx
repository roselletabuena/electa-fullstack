"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useIsMounted } from "@/hooks/use-is-mounted";
import {
  Calendar,
  Sparkles,
  AlertCircle,
  Loader2,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Layers,
  FileCheck2,
} from "lucide-react";
import {
  createEventWizardSchema,
  type CreateEventWizardInput,
  type WizardPositionDraftInput,
  type WizardDivisionDraftInput,
  type WizardAwardDraftInput,
} from "@/lib/validations/archetype-wizard";
import { sanitizeSlug } from "@/lib/validations/event";
import { createEventAction } from "../actions/create-event";
import { useDebouncedSlugCheck } from "../hooks/useDebouncedSlugCheck";
import { SlugAvailabilityBadge } from "./SlugAvailabilityBadge";
import { BannerAspectPreview } from "./dashboard/BannerAspectPreview";
import { ArchetypeSelector } from "./archetype-selector";
import { TaxonomyEditor } from "./taxonomy-editor";
import {
  EVENT_ARCHETYPE_CONFIGS,
  isArchetypeAvailable,
  type EventArchetype,
} from "../types/archetype";
import {
  TIMELINE_PRESETS,
  calculateEndsAtFromDuration,
  getActivePreset,
  isTemporalWindowValid,
  formatLocalDateTime,
} from "../utils/timeline-presets";
import {
  saveDraftToSession,
  clearDraftFromSession,
  useSessionDraft,
} from "../utils/event-draft-storage";
import { cn } from "@/lib/utils";

export interface EventCreationWizardProps {
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
  archetype: EventArchetype;
}

function getDefaultDates(): { startsAt: string; endsAt: string } {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  tomorrow.setMinutes(0, 0, 0);

  const thirtyDaysLater = new Date(tomorrow.getTime() + 30 * 24 * 60 * 60 * 1000);
  thirtyDaysLater.setMinutes(0, 0, 0);

  return {
    startsAt: formatLocalDateTime(tomorrow),
    endsAt: formatLocalDateTime(thirtyDaysLater),
  };
}

const WIZARD_STEPS = [
  { id: 1, title: "Event Details", icon: Calendar },
  { id: 2, title: "Event Format & Categories", icon: Layers },
  { id: 3, title: "Review & Launch", icon: FileCheck2 },
] as const;

function getStepButtonClass(isActive: boolean, isCompleted: boolean): string {
  if (isActive) {
    return "border-b-2 border-sky-600 bg-sky-50/60 text-sky-950 dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-200";
  }
  if (isCompleted) {
    return "text-emerald-700 hover:bg-slate-50 dark:text-emerald-400 dark:hover:bg-slate-900 cursor-pointer";
  }
  return "text-slate-400 dark:text-slate-600 cursor-not-allowed";
}

function getStepBadgeClass(isActive: boolean, isCompleted: boolean): string {
  if (isActive) {
    return "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950";
  }
  if (isCompleted) {
    return "border-emerald-600 bg-emerald-600 text-white";
  }
  return "border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-500";
}

export function EventCreationWizard({
  onSuccess,
  onCancel,
  className,
}: Readonly<EventCreationWizardProps>): React.JSX.Element {
  const router = useRouter();
  const defaultDates = getDefaultDates();

  const sessionDraft = useSessionDraft();
  const hasRestoredRef = useRef(false);
  const isMounted = useIsMounted();

  const [currentStep, setCurrentStep] = useState(1);
  const [userCustomSlug, setUserCustomSlug] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const isCustomSlug = userCustomSlug || Boolean(sessionDraft?.isCustomSlug);
  const isDraftRestored = Boolean(sessionDraft);

  // In-memory taxonomy items for Step 2
  const [positions, setPositions] = useState<WizardPositionDraftInput[]>([]);
  const [divisions, setDivisions] = useState<WizardDivisionDraftInput[]>([]);
  const [awardCategories, setAwardCategories] = useState<WizardAwardDraftInput[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<FormRawValues>({
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      bannerUrl: "",
      startsAt: defaultDates.startsAt,
      endsAt: defaultDates.endsAt,
      archetype: "PAGEANT",
    },
    mode: "onChange",
  });

  // Restore draft from sessionStorage after initial mount to prevent SSR hydration mismatch
  useEffect(() => {
    if (sessionDraft && !hasRestoredRef.current) {
      hasRestoredRef.current = true;
      reset({
        title: sessionDraft.title || "",
        slug: sessionDraft.slug || "",
        description: sessionDraft.description || "",
        bannerUrl: sessionDraft.bannerUrl || "",
        startsAt: sessionDraft.startsAt || defaultDates.startsAt,
        endsAt: sessionDraft.endsAt || defaultDates.endsAt,
        archetype: (sessionDraft.archetype as EventArchetype) || "PAGEANT",
      });
    }
  }, [sessionDraft, reset, defaultDates.startsAt, defaultDates.endsAt]);

  const watchedTitle = useWatch({ control, name: "title" }) ?? "";
  const watchedSlug = useWatch({ control, name: "slug" }) ?? "";
  const watchedDescription = useWatch({ control, name: "description" }) ?? "";
  const watchedBannerUrl = useWatch({ control, name: "bannerUrl" }) ?? "";
  const watchedStartsAt = useWatch({ control, name: "startsAt" }) ?? defaultDates.startsAt;
  const watchedEndsAt = useWatch({ control, name: "endsAt" }) ?? defaultDates.endsAt;
  const watchedArchetype = useWatch({ control, name: "archetype" }) ?? "PAGEANT";

  const slugCheck = useDebouncedSlugCheck(watchedSlug);

  // Persist form state to sessionStorage on change (only after initial mount)
  useEffect(() => {
    if (!isMounted) return;
    if (
      watchedTitle.trim() ||
      watchedSlug.trim() ||
      watchedDescription.trim() ||
      watchedBannerUrl.trim()
    ) {
      saveDraftToSession({
        title: watchedTitle,
        slug: watchedSlug,
        description: watchedDescription,
        bannerUrl: watchedBannerUrl,
        startsAt: watchedStartsAt,
        endsAt: watchedEndsAt,
        isCustomSlug,
        archetype: watchedArchetype,
      });
    }
  }, [
    isMounted,
    watchedTitle,
    watchedSlug,
    watchedDescription,
    watchedBannerUrl,
    watchedStartsAt,
    watchedEndsAt,
    isCustomSlug,
    watchedArchetype,
  ]);

  const isTemporalValid = isTemporalWindowValid(watchedStartsAt, watchedEndsAt);
  const isTemporalInvalid = Boolean(watchedStartsAt && watchedEndsAt && !isTemporalValid);
  const activePreset = getActivePreset(watchedStartsAt, watchedEndsAt);

  const handleApplyPreset = (days: number) => {
    const baseStartsAt = watchedStartsAt || defaultDates.startsAt;
    const computedEndsAt = calculateEndsAtFromDuration(baseStartsAt, days);
    if (computedEndsAt) {
      setValue("endsAt", computedEndsAt, { shouldValidate: true });
    }
  };

  const handleClearDraft = () => {
    clearDraftFromSession();
    const freshDates = getDefaultDates();
    hasRestoredRef.current = false;
    setUserCustomSlug(false);
    reset({
      title: "",
      slug: "",
      description: "",
      bannerUrl: "",
      startsAt: freshDates.startsAt,
      endsAt: freshDates.endsAt,
      archetype: "PAGEANT",
    });
    setPositions([]);
    setDivisions([]);
    setAwardCategories([]);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle, { shouldValidate: true });

    if (!isCustomSlug) {
      const generatedSlug = sanitizeSlug(newTitle);
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  };

  const handleResetSlugToTitle = () => {
    setUserCustomSlug(false);
    const generatedSlug = sanitizeSlug(watchedTitle || "");
    setValue("slug", generatedSlug, { shouldValidate: true });
  };

  // Step 1 Validation before advancing
  const handleProceedToStep2 = () => {
    setStepError(null);
    if (!watchedTitle.trim() || watchedTitle.trim().length < 3) {
      setStepError("Title must be at least 3 characters.");
      return;
    }
    if (!watchedSlug.trim() || watchedSlug.trim().length < 3) {
      setStepError("Slug must be at least 3 characters.");
      return;
    }
    if (
      slugCheck.status === "unavailable" ||
      slugCheck.status === "reserved" ||
      slugCheck.status === "invalid"
    ) {
      setStepError(
        slugCheck.message || "This URL slug is not available. Please choose another one.",
      );
      return;
    }
    if (!watchedBannerUrl.trim()) {
      setStepError("Banner URL is required.");
      return;
    }
    if (isTemporalInvalid) {
      setStepError("Event end time must be at least 1 hour after the start time.");
      return;
    }
    if (!watchedDescription.trim() || watchedDescription.trim().length < 10) {
      setStepError("Description must be at least 10 characters.");
      return;
    }

    setCurrentStep(2);
  };

  // Step 2 Validation before advancing to Review
  const handleProceedToStep3 = () => {
    setStepError(null);
    if (!isArchetypeAvailable(watchedArchetype)) {
      setStepError("This event archetype is coming soon and currently disabled.");
      return;
    }
    // Scenario 2: Validation & Error Handling - Incomplete Archetype Taxonomy
    if (watchedArchetype === "HACKATHON" && positions.length === 0) {
      setStepError("At least one challenge track or category is required for hackathons.");
      return;
    }

    setCurrentStep(3);
  };

  const onSubmit = async (values: FormRawValues) => {
    setServerError(null);
    setStepError(null);

    if (!isArchetypeAvailable(values.archetype)) {
      setStepError("This event archetype is coming soon and currently disabled.");
      setCurrentStep(2);
      return;
    }

    // Final check for hackathon track requirement
    if (values.archetype === "HACKATHON" && positions.length === 0) {
      setStepError("At least one challenge track or category is required for hackathons.");
      setCurrentStep(2);
      return;
    }

    const payload: CreateEventWizardInput = {
      title: values.title.trim(),
      slug: values.slug.trim().toLowerCase(),
      description: values.description.trim(),
      bannerUrl: values.bannerUrl.trim(),
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
      archetype: values.archetype,
      positions,
      divisions,
      awardCategories,
    };

    const validation = createEventWizardSchema.safeParse(payload);
    if (!validation.success) {
      setServerError(validation.error.issues.map((i) => i.message).join(", "));
      return;
    }

    try {
      const res = await createEventAction({
        title: payload.title,
        slug: payload.slug,
        description: payload.description,
        bannerUrl: payload.bannerUrl,
        startsAt: payload.startsAt,
        endsAt: payload.endsAt,
        archetype: payload.archetype,
        positions: payload.positions,
        divisions: payload.divisions,
        awardCategories: payload.awardCategories,
      });

      if (!res.success) {
        setServerError(res.error || "Failed to create event. Please try again.");
        return;
      }

      clearDraftFromSession();

      if (onSuccess) {
        onSuccess(res.data.slug);
      } else {
        router.push(`/events/${res.data.slug}`);
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "An unexpected network error occurred.");
    }
  };

  const renderRosterSummary = () => {
    if (watchedArchetype === "PAGEANT") {
      if (divisions.length === 0) {
        return <span className="text-xs text-slate-400">No divisions added</span>;
      }
      return divisions.map((d) => (
        <span
          key={d.name}
          className="rounded-none border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {d.name}
        </span>
      ));
    }

    if (positions.length === 0) {
      return <span className="text-xs text-slate-400">No positions added</span>;
    }

    return positions.map((p) => (
      <span
        key={p.name}
        className="rounded-none border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        {p.name} ({p.maxSelectionsPerVoter > 1 ? `${p.maxSelectionsPerVoter} seats` : "1 seat"})
      </span>
    ));
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Draft Restored Banner */}
      {isDraftRestored && (
        <aside
          aria-label="Draft recovery notification"
          className="flex flex-col items-start justify-between gap-3 rounded-none border border-sky-300 bg-sky-50 p-4 sm:flex-row sm:items-center dark:border-sky-500/30 dark:bg-sky-500/10"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <p className="text-xs font-semibold text-sky-950 dark:text-sky-200">
              Draft Restored: We recovered your previously entered event details from this session.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearDraft}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-none border border-sky-400 bg-white px-3 py-1 text-xs font-extrabold tracking-wider text-sky-950 uppercase transition hover:bg-sky-100 dark:border-sky-500/50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-slate-800"
          >
            <RotateCcw className="size-3" />
            <span>Clear Draft</span>
          </button>
        </aside>
      )}

      {/* Stepper Navigation */}
      <nav
        aria-label="Wizard Steps"
        className="rounded-none border border-slate-300 bg-white p-3 dark:border-slate-800 dark:bg-[#0d1424]"
      >
        <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {WIZARD_STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <li key={step.id} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                  disabled={step.id > currentStep}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-2.5 rounded-none px-3 py-2 text-left text-xs font-bold transition",
                    getStepButtonClass(isActive, isCompleted),
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-none border text-[11px] font-black",
                      getStepBadgeClass(isActive, isCompleted),
                    )}
                  >
                    {isCompleted ? "✓" : step.id}
                  </span>
                  <span className="font-heading tracking-wider uppercase">{step.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Errors / Server Errors */}
      {(stepError || serverError) && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-none border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{stepError || serverError}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: General Information & Schedule */}
        {currentStep === 1 && (
          <div className="space-y-6 rounded-none border border-slate-300 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="font-heading text-base font-black tracking-tight text-slate-900 dark:text-slate-100">
                1. Event Details & Operational Schedule
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Define the public title, custom URL slug, visual banner, and voting timeline.
              </p>
            </div>

            {/* Title & Slug */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="event-title"
                  className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                >
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="event-title"
                  type="text"
                  {...register("title")}
                  onChange={handleTitleChange}
                  placeholder="e.g. University Student Council General Election 2026"
                  className="mt-1 block w-full rounded-none border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="event-slug"
                    className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                  >
                    Custom URL Slug <span className="text-red-500">*</span>
                  </label>
                  {isCustomSlug && (
                    <button
                      type="button"
                      onClick={handleResetSlugToTitle}
                      className="cursor-pointer text-[11px] font-bold text-sky-600 hover:underline dark:text-sky-400"
                    >
                      Reset to match title
                    </button>
                  )}
                </div>
                <div className="relative mt-1 flex items-center">
                  <span className="inline-flex min-h-11 items-center rounded-none border border-r-0 border-slate-300 bg-slate-50 px-3 font-mono text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    electa.com/events/
                  </span>
                  <input
                    id="event-slug"
                    type="text"
                    {...register("slug")}
                    onChange={(e) => {
                      setUserCustomSlug(true);
                      setValue("slug", sanitizeSlug(e.target.value), { shouldValidate: true });
                    }}
                    placeholder="my-event-slug"
                    className="block w-full rounded-none border border-slate-300 bg-white px-3 py-2.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <SlugAvailabilityBadge status={slugCheck.status} message={slugCheck.message} />
                </div>
              </div>
            </div>

            {/* Banner URL & Preview */}
            <div className="space-y-2">
              <label
                htmlFor="banner-url"
                className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              >
                Banner Image URL <span className="text-red-500">*</span>
              </label>
              <input
                id="banner-url"
                type="url"
                {...register("bannerUrl")}
                placeholder="https://example.com/banner.jpg"
                className="block w-full rounded-none border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <BannerAspectPreview
                imageUrl={watchedBannerUrl}
                title={watchedTitle || "Event Banner Preview"}
              />
            </div>

            {/* Schedule & Duration Presets */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Voting Window Timeline
                </span>
                {/* Duration Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Duration:</span>
                  {TIMELINE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.days)}
                      className={cn(
                        "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-none px-2.5 text-xs font-bold tracking-wider uppercase transition",
                        activePreset === preset.id
                          ? "border border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950"
                          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="starts-at"
                    className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                  >
                    Starts At <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="starts-at"
                    type="datetime-local"
                    {...register("startsAt")}
                    className="mt-1 block w-full rounded-none border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-sky-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ends-at"
                    className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                  >
                    Ends At <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ends-at"
                    type="datetime-local"
                    {...register("endsAt")}
                    className={cn(
                      "mt-1 block w-full rounded-none border bg-white px-3 py-2 font-mono text-xs focus:outline-hidden dark:bg-slate-900",
                      isTemporalInvalid
                        ? "border-red-500 text-red-900 dark:border-red-500 dark:text-red-300"
                        : "border-slate-300 text-slate-900 focus:border-sky-600 dark:border-slate-700 dark:text-slate-100",
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="event-description"
                className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              >
                Event Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="event-description"
                rows={4}
                {...register("description")}
                placeholder="Describe your competition or election rules, eligibility, and voter guidelines..."
                className="mt-1 block w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex min-h-11 cursor-pointer items-center rounded-none border border-slate-300 bg-white px-4 py-2 text-xs font-extrabold tracking-wider text-slate-700 uppercase hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleProceedToStep2}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-none border border-slate-900 bg-slate-900 px-5 py-2 text-xs font-black tracking-wider text-white uppercase transition hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <span>Continue to Format & Categories</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Event Format & Categories (Archetype & Taxonomy) */}
        {currentStep === 2 && (
          <div className="space-y-6 rounded-none border border-slate-300 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="font-heading text-base font-black tracking-tight text-slate-900 dark:text-slate-100">
                2. Select Event Format & Categories
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Tailor the voting engine format to your event. Toggling formats dynamically updates
                ballot grouping and terminology without resetting your event details.
              </p>
            </div>

            {/* Archetype Selector */}
            <ArchetypeSelector
              value={watchedArchetype}
              onChange={(newArch) => {
                setValue("archetype", newArch, { shouldValidate: true });
                setStepError(null);
              }}
            />

            {/* Dynamic Monetization Notice / Fields */}
            {watchedArchetype === "PAGEANT" ? (
              <div className="rounded-none border border-amber-300 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 text-xs font-extrabold tracking-widest text-amber-900 uppercase dark:text-amber-300">
                  <Sparkles className="size-3.5" />
                  <span>Pageant Monetization & Voting Packs</span>
                </div>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-400">
                  Standard pageant monetization is enabled. Voters can purchase paid vote packages
                  or cast free daily votes.
                </p>
              </div>
            ) : (
              <div className="rounded-none border border-sky-300 bg-sky-50/60 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
                <div className="flex items-center gap-2 text-xs font-extrabold tracking-widest text-sky-950 uppercase dark:text-sky-300">
                  <CheckCircle2 className="size-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Institutional Free Ballot Mode</span>
                </div>
                <p className="mt-1 text-xs text-sky-900 dark:text-sky-300">
                  Monetized vote packages and take rates are disabled. Every verified voter receives
                  equal ballot weight for this{" "}
                  {EVENT_ARCHETYPE_CONFIGS[watchedArchetype].label.toLowerCase()}.
                </p>
              </div>
            )}

            {/* Dynamic Taxonomy Editor */}
            <TaxonomyEditor
              archetype={watchedArchetype}
              positions={positions}
              onPositionsChange={setPositions}
              divisions={divisions}
              onDivisionsChange={setDivisions}
              awardCategories={awardCategories}
              onAwardCategoriesChange={setAwardCategories}
            />

            {/* Step Navigation */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-none border border-slate-300 bg-white px-4 py-2 text-xs font-bold tracking-wider text-slate-700 uppercase hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <ArrowLeft className="size-4" />
                <span>Back to Details</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToStep3}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-none border border-slate-900 bg-slate-900 px-5 py-2 text-xs font-black tracking-wider text-white uppercase transition hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <span>Review & Finalize</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Finalize */}
        {currentStep === 3 && (
          <div className="space-y-6 rounded-none border border-slate-300 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="font-heading text-base font-black tracking-tight text-slate-900 dark:text-slate-100">
                3. Review Event Configuration
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Verify your event settings and taxonomy before publishing the draft.
              </p>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-none border border-slate-200 p-4 dark:border-slate-800">
                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                  Event Profile
                </span>
                <div className="font-heading mt-2 text-base font-black text-slate-900 dark:text-slate-100">
                  {watchedTitle}
                </div>
                <div className="mt-1 font-mono text-xs text-sky-600 dark:text-sky-400">
                  /events/{watchedSlug}
                </div>
              </div>

              <div className="rounded-none border border-slate-200 p-4 dark:border-slate-800">
                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                  Event Format & Categories
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-none border border-sky-600 bg-sky-50 px-2 py-0.5 text-xs font-black tracking-wider text-sky-900 uppercase dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-300">
                    {EVENT_ARCHETYPE_CONFIGS[watchedArchetype].label}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  {watchedArchetype === "PAGEANT"
                    ? `${divisions.length} Divisions, ${awardCategories.length} Award Tracks`
                    : `${positions.length} ${EVENT_ARCHETYPE_CONFIGS[watchedArchetype].groupingTerm}s configured`}
                </div>
              </div>
            </div>

            {/* List of Configured Items Summary */}
            <div className="rounded-none border border-slate-200 p-4 dark:border-slate-800">
              <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                {EVENT_ARCHETYPE_CONFIGS[watchedArchetype].groupingTerm} Roster Summary
              </span>
              <div className="mt-2 flex flex-wrap gap-2">{renderRosterSummary()}</div>
            </div>

            {/* Submit / Back Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={isSubmitting}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-none border border-slate-300 bg-white px-4 py-2 text-xs font-bold tracking-wider text-slate-700 uppercase hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <ArrowLeft className="size-4" />
                <span>Back to Format & Categories</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-none border border-sky-600 bg-sky-600 px-6 py-2 text-xs font-black tracking-wider text-white uppercase shadow-sm transition hover:bg-sky-500 disabled:opacity-50 dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Creating Event...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span>Create & Launch Draft Event</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
