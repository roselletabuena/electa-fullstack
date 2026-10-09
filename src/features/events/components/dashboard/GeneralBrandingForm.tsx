"use client";

import React, { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Sparkles, AlertCircle, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BannerAspectPreview } from "./BannerAspectPreview";
import { CopySlugButton } from "./CopySlugButton";
import {
  updateEventBrandingSchema,
  type UpdateEventBrandingInput,
} from "@/lib/validations/event-branding";
import { updateEventBrandingAction } from "@/features/events/actions/update-event-branding";
import type { Event } from "@/generated/client/client";
import { cn } from "@/lib/utils";

export interface GeneralBrandingFormProps {
  event: Event;
  className?: string;
}

export function GeneralBrandingForm({
  event,
  className,
}: Readonly<GeneralBrandingFormProps>): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
    setError,
  } = useForm<UpdateEventBrandingInput>({
    resolver: zodResolver(updateEventBrandingSchema),
    defaultValues: {
      title: event.title || "",
      description: event.description || "",
      bannerUrl: event.bannerUrl || "",
      reason: "",
    },
  });

  const watchedTitle = useWatch({ control, name: "title" }) ?? "";
  const watchedDescription = useWatch({ control, name: "description" }) ?? "";
  const watchedBannerUrl = useWatch({ control, name: "bannerUrl" }) ?? "";
  const watchedReason = useWatch({ control, name: "reason" }) ?? "";

  const onSubmit = (data: UpdateEventBrandingInput) => {
    setStatusMessage(null);

    startTransition(async () => {
      const response = await updateEventBrandingAction(event.slug, data);

      if (response.success) {
        setStatusMessage({
          type: "success",
          message: response.message || "Event branding updated successfully!",
        });
        reset(data); // Rebase dirty state to new values
      } else {
        setStatusMessage({
          type: "error",
          message: response.error || "Failed to update branding settings.",
        });

        if (response.fieldErrors) {
          for (const [field, messages] of Object.entries(response.fieldErrors)) {
            if (messages?.[0]) {
              setError(field as keyof UpdateEventBrandingInput, {
                type: "server",
                message: messages[0],
              });
            }
          }
        }
      }
    });
  };

  const isWorking = isPending || isSubmitting;

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Event Identity & Public Branding
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Manage public-facing competition titles, descriptions, and high-resolution banner
                  artwork.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs tracking-wider uppercase">
                  {event.publicationStatus}
                </Badge>
                {isDirty && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <Sparkles className="size-3" />
                    Unsaved changes
                  </span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Alert Banner */}
            {statusMessage && (
              <div
                role="status"
                aria-live="polite"
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-xs font-medium transition-all",
                  statusMessage.type === "success"
                    ? "border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-rose-500/30 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-300",
                )}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                )}
                <p className="flex-1">{statusMessage.message}</p>
              </div>
            )}

            {/* Row 1: Event Title & Public Slug */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Event Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="title"
                    className="text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                  >
                    Event Title <span className="text-rose-500">*</span>
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">
                    {watchedTitle.length} / 100
                  </span>
                </div>
                <input
                  id="title"
                  type="text"
                  {...register("title")}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  className={cn(
                    "w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 transition focus:ring-2 focus:outline-hidden dark:bg-slate-950 dark:text-slate-100",
                    errors.title
                      ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-300 hover:border-slate-400 focus:border-violet-500 focus:ring-violet-500/20 dark:border-slate-800 dark:hover:border-slate-700",
                  )}
                  placeholder="e.g. Miss Visayas 2026"
                />
                {errors.title && (
                  <p id="title-error" className="text-xs font-medium text-rose-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Public Slug (Read-only + Copy Button) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                    Public URL Identifier
                  </label>
                  <span className="py-0.2 rounded-sm bg-slate-200/60 px-1.5 font-mono text-[10px] font-semibold text-slate-600 uppercase dark:bg-slate-800 dark:text-slate-400">
                    Permanent
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 py-2.5 font-mono text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
                    <Globe className="size-4 shrink-0 text-slate-400" />
                    <span className="truncate">/events/{event.slug}</span>
                  </div>
                  <CopySlugButton slug={event.slug} />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Slugs are immutable after event creation to preserve canonical voter links.
                </p>
              </div>
            </div>

            {/* Row 2: Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="description"
                  className="text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                >
                  Event Description
                </label>
                <span className="font-mono text-[11px] text-slate-400">
                  {watchedDescription.length} / 2000
                </span>
              </div>
              <textarea
                id="description"
                rows={4}
                {...register("description")}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? "description-error" : undefined}
                className={cn(
                  "w-full rounded-xl border bg-slate-50/50 p-3.5 text-sm text-slate-900 transition focus:ring-2 focus:outline-hidden dark:bg-slate-950 dark:text-slate-100",
                  errors.description
                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-300 hover:border-slate-400 focus:border-violet-500 focus:ring-violet-500/20 dark:border-slate-800 dark:hover:border-slate-700",
                )}
                placeholder="Describe your pageant, competition vision, judging criteria, or special announcements..."
              />
              {errors.description && (
                <p id="description-error" className="text-xs font-medium text-rose-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Row 3: Banner Image URL Input */}
            <div className="space-y-2">
              <label
                htmlFor="bannerUrl"
                className="text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              >
                Banner Artwork URL <span className="text-rose-500">*</span>
              </label>
              <input
                id="bannerUrl"
                type="url"
                {...register("bannerUrl")}
                aria-invalid={Boolean(errors.bannerUrl)}
                aria-describedby={errors.bannerUrl ? "bannerUrl-error" : undefined}
                className={cn(
                  "w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 font-mono text-sm text-slate-900 transition focus:ring-2 focus:outline-hidden dark:bg-slate-950 dark:text-slate-100",
                  errors.bannerUrl
                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-300 hover:border-slate-400 focus:border-violet-500 focus:ring-violet-500/20 dark:border-slate-800 dark:hover:border-slate-700",
                )}
                placeholder="https://images.unsplash.com/... or https://cdn.example.com/banner.jpg"
              />
              {errors.bannerUrl && (
                <p id="bannerUrl-error" className="text-xs font-medium text-rose-500">
                  {errors.bannerUrl.message}
                </p>
              )}
            </div>

            {/* Live Aspect Ratio Preview Widget */}
            <BannerAspectPreview imageUrl={watchedBannerUrl} title={watchedTitle || event.title} />

            {/* Row 4: Optional Audit Reason */}
            <div className="space-y-2 border-t border-slate-200/60 pt-4 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reason"
                  className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
                >
                  Reason for Change{" "}
                  <span className="font-normal text-slate-400 lowercase">
                    (optional audit note)
                  </span>
                </label>
                <span className="font-mono text-[11px] text-slate-400">
                  {watchedReason.length} / 500
                </span>
              </div>
              <input
                id="reason"
                type="text"
                {...register("reason")}
                aria-invalid={Boolean(errors.reason)}
                aria-describedby={errors.reason ? "reason-error" : undefined}
                className={cn(
                  "w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 transition focus:ring-2 focus:outline-hidden dark:bg-slate-950 dark:text-slate-100",
                  errors.reason
                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-200 hover:border-slate-300 focus:border-violet-500 focus:ring-violet-500/20 dark:border-slate-800 dark:hover:border-slate-700",
                )}
                placeholder="e.g. Updated sponsor logos, refreshed event header artwork"
              />
              {errors.reason && (
                <p id="reason-error" className="text-xs font-medium text-rose-500">
                  {errors.reason.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col-reverse gap-3 border-t border-slate-200/80 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end dark:border-slate-800 dark:bg-slate-950/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!isDirty || isWorking}
              onClick={() => {
                reset();
                setStatusMessage(null);
              }}
              className="cursor-pointer text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Discard Changes
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isWorking || !isDirty}
              className="cursor-pointer bg-violet-600 font-semibold text-white shadow-md hover:bg-violet-700"
            >
              {isWorking ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
