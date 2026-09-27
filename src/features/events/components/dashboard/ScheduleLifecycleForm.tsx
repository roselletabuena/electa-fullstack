"use client";

import React, { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Clock,
  Globe,
  KeyRound,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  Archive,
  FileEdit,
  Save,
  Trash2,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  scheduleLifecycleFormSchema,
  type ScheduleLifecycleFormValues,
} from "@/lib/validations/event-schedule-lifecycle";
import { updateScheduleLifecycleAction } from "@/features/events/actions/update-schedule-lifecycle";
import type { Event, EventPublicationStatus } from "@/generated/client/client";
import { cn } from "@/lib/utils";

export interface ScheduleLifecycleFormProps {
  event: Event;
  className?: string;
}

const STATUS_CONFIG: Record<
  EventPublicationStatus,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
  }
> = {
  DRAFT: {
    label: "Draft",
    description: "Unpublished. Private to organizers or reviewers with preview passphrase.",
    icon: FileEdit,
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  },
  PUBLISHED: {
    label: "Published",
    description: "Live to the public. Voting opens and closes per operational schedule.",
    icon: Globe,
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  ARCHIVED: {
    label: "Archived",
    description: "Concluded. Voting is locked permanently. Results visible in read-only mode.",
    icon: Archive,
    badgeClass:
      "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
};

function formatForDateTimeInput(dateVal: Date | string): string {
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function calculateDuration(startsAtStr: string, endsAtStr: string): string | null {
  const start = new Date(startsAtStr).getTime();
  const end = new Date(endsAtStr).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return null;
  const diffMs = end - start;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0 || days === 0) parts.push(`${hours} hr${hours !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

export function ScheduleLifecycleForm({
  event,
  className,
}: ScheduleLifecycleFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [hasPassphrase, setHasPassphrase] = useState<boolean>(Boolean(event.draftPassphraseHash));
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [pendingValues, setPendingValues] = useState<ScheduleLifecycleFormValues | null>(null);

  const defaultValues: ScheduleLifecycleFormValues = {
    startsAt: formatForDateTimeInput(event.startsAt),
    endsAt: formatForDateTimeInput(event.endsAt),
    publicationStatus: event.publicationStatus ?? "DRAFT",
    draftPassphrase: "",
    clearDraftPassphrase: false,
    reason: "",
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
    setError,
  } = useForm<ScheduleLifecycleFormValues>({
    resolver: zodResolver(scheduleLifecycleFormSchema),
    defaultValues,
  });

  const watchedStartsAt = useWatch({ control, name: "startsAt" }) ?? "";
  const watchedEndsAt = useWatch({ control, name: "endsAt" }) ?? "";
  const watchedStatus = useWatch({ control, name: "publicationStatus" }) ?? "DRAFT";
  const watchedClearPassphrase = useWatch({ control, name: "clearDraftPassphrase" }) ?? false;
  const watchedReason = useWatch({ control, name: "reason" }) ?? "";

  const durationText = calculateDuration(watchedStartsAt, watchedEndsAt);

  const commitSubmission = (data: ScheduleLifecycleFormValues) => {
    setStatusMessage(null);

    // Convert local datetime-local strings to standard ISO UTC strings
    const submissionPayload = {
      ...data,
      startsAt: new Date(data.startsAt).toISOString(),
      endsAt: new Date(data.endsAt).toISOString(),
    };

    startTransition(async () => {
      const response = await updateScheduleLifecycleAction(event.slug, submissionPayload);

      if (response.success) {
        setStatusMessage({
          type: "success",
          message: response.message || "Schedule & lifecycle settings updated successfully!",
        });

        if (data.clearDraftPassphrase) {
          setHasPassphrase(false);
        } else if (data.draftPassphrase && data.draftPassphrase.trim().length > 0) {
          setHasPassphrase(true);
        }

        // Rebase form
        reset({
          ...data,
          draftPassphrase: "",
          clearDraftPassphrase: false,
          reason: "",
        });
      } else {
        setStatusMessage({
          type: "error",
          message: response.error || "Failed to update schedule settings.",
        });

        if (response.fieldErrors) {
          for (const [field, messages] of Object.entries(response.fieldErrors)) {
            if (messages && messages[0]) {
              setError(field as keyof ScheduleLifecycleFormValues, {
                type: "server",
                message: messages[0],
              });
            }
          }
        }
      }
    });
  };

  const onSubmit = (data: ScheduleLifecycleFormValues) => {
    // If publication status changed from initial event state, require modal confirmation
    if (data.publicationStatus !== event.publicationStatus) {
      setPendingValues(data);
      setConfirmModalOpen(true);
      return;
    }

    commitSubmission(data);
  };

  const handleConfirmTransition = () => {
    if (pendingValues) {
      const payload = pendingValues;
      setConfirmModalOpen(false);
      setPendingValues(null);
      commitSubmission(payload);
    }
  };

  const isWorking = isPending || isSubmitting;

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-slate-200 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-indigo-600 dark:text-indigo-400" />
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Schedule & Publication Lifecycle
                  </CardTitle>
                </div>
                <CardDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Configure voting start/end operational windows, publication status, and draft
                  preview passphrase.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2.5 py-0.5 text-xs font-medium transition-colors",
                    STATUS_CONFIG[watchedStatus].badgeClass,
                  )}
                >
                  <span
                    className={cn(
                      "mr-1.5 inline-block size-1.5 rounded-full",
                      watchedStatus === "PUBLISHED"
                        ? "bg-emerald-500"
                        : watchedStatus === "ARCHIVED"
                          ? "bg-slate-500"
                          : "bg-amber-500",
                    )}
                  />
                  {STATUS_CONFIG[watchedStatus].label} Status
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            {/* Status Alert Banner */}
            {statusMessage && (
              <div
                role="status"
                aria-live="polite"
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 text-sm transition-all",
                  statusMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-red-200 bg-red-50/80 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
                )}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                )}
                <div className="flex-1 font-medium">{statusMessage.message}</div>
              </div>
            )}

            {/* Section 1: Voting Operational Window */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Operational Voting Window
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Times are in Philippine Standard Time (PST / Asia/Manila, UTC+8).
                  </p>
                </div>
                {durationText && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                    <Clock className="size-3.5" />
                    Duration: {durationText}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Starts At Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="startsAt"
                    className="text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                  >
                    Voting Starts At <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="startsAt"
                    type="datetime-local"
                    {...register("startsAt")}
                    className={cn(
                      "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
                      errors.startsAt && "border-red-500 focus:border-red-500 focus:ring-red-500",
                    )}
                  />
                  {errors.startsAt && (
                    <p className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                      <AlertCircle className="size-3" />
                      {errors.startsAt.message}
                    </p>
                  )}
                </div>

                {/* Ends At Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="endsAt"
                    className="text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                  >
                    Voting Ends At (Cutoff) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="endsAt"
                    type="datetime-local"
                    {...register("endsAt")}
                    className={cn(
                      "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
                      errors.endsAt && "border-red-500 focus:border-red-500 focus:ring-red-500",
                    )}
                  />
                  {errors.endsAt && (
                    <p className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                      <AlertCircle className="size-3" />
                      {errors.endsAt.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Publication Lifecycle Status */}
            <div className="space-y-3 border-t border-slate-100 pt-6 dark:border-slate-800/80">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Publication Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Control the visibility and lifecycle phase of this event.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(["DRAFT", "PUBLISHED", "ARCHIVED"] as const).map((status) => {
                  const isSelected = watchedStatus === status;
                  const config = STATUS_CONFIG[status];
                  const Icon = config.icon;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setValue("publicationStatus", status, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600",
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-600 dark:border-indigo-500 dark:bg-indigo-950/40 dark:ring-indigo-500"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60",
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={cn(
                              "size-4",
                              isSelected
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400 dark:text-slate-500",
                            )}
                          />
                          <span
                            className={cn(
                              "font-semibold",
                              isSelected
                                ? "text-indigo-950 dark:text-indigo-100"
                                : "text-slate-800 dark:text-slate-200",
                            )}
                          >
                            {config.label}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="size-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {config.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Draft Review Passphrase */}
            <div className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="size-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Draft Review Passphrase
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Allows invited reviewers (sponsors, contestants, judges) to inspect the event
                    page while in Draft mode.
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    hasPassphrase && !watchedClearPassphrase
                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
                  )}
                >
                  {hasPassphrase && !watchedClearPassphrase ? (
                    <span className="flex items-center gap-1">
                      <Lock className="size-3" /> Passphrase Set
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Unlock className="size-3" /> No Passphrase
                    </span>
                  )}
                </Badge>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <input
                      id="draftPassphrase"
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        hasPassphrase && !watchedClearPassphrase
                          ? "Enter new passphrase to replace existing..."
                          : "Set draft preview passphrase (min 4 chars)..."
                      }
                      {...register("draftPassphrase")}
                      className={cn(
                        "w-full rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
                        errors.draftPassphrase &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showPassword ? "Hide passphrase" : "Show passphrase"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {hasPassphrase && !watchedClearPassphrase && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setValue("clearDraftPassphrase", true, { shouldDirty: true });
                        setValue("draftPassphrase", "", { shouldDirty: true });
                      }}
                      className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="size-3.5" />
                      Remove Passphrase
                    </Button>
                  )}

                  {watchedClearPassphrase && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Passphrase marked for removal
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setValue("clearDraftPassphrase", false, { shouldDirty: true })
                        }
                        className="text-xs text-slate-500"
                      >
                        Undo
                      </Button>
                    </div>
                  )}
                </div>

                {errors.draftPassphrase && (
                  <p className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                    <AlertCircle className="size-3" />
                    {errors.draftPassphrase.message}
                  </p>
                )}
              </div>
            </div>

            {/* Section 4: Reason for Adjustment */}
            <div className="space-y-1.5 border-t border-slate-100 pt-6 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reason"
                  className="text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                >
                  Reason for Adjustment{" "}
                  <span className="font-normal text-slate-400 lowercase">(optional)</span>
                </label>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    watchedReason.length > 500
                      ? "font-bold text-red-500"
                      : "text-slate-400 dark:text-slate-500",
                  )}
                >
                  {watchedReason.length} / 500
                </span>
              </div>
              <textarea
                id="reason"
                rows={2}
                placeholder="e.g. Adjusted operational voting window for grand coronation..."
                {...register("reason")}
                className={cn(
                  "w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
                  errors.reason && "border-red-500 focus:border-red-500 focus:ring-red-500",
                )}
              />
              {errors.reason && (
                <p className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                  <AlertCircle className="size-3" />
                  {errors.reason.message}
                </p>
              )}
            </div>

            {/* Governance & Audit Note */}
            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
              <ShieldCheck className="size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <p>
                <strong>Audit Trail Enforced:</strong> All schedule, lifecycle, and security
                adjustments are recorded immediately in the immutable event audit trail.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/50">
            <div>
              {isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isWorking}
                  onClick={() => {
                    reset(defaultValues);
                    setHasPassphrase(Boolean(event.draftPassphraseHash));
                  }}
                  className="gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <RotateCcw className="size-3.5" />
                  Discard Changes
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={isWorking || !isDirty}
                className="w-full gap-2 font-semibold shadow-xs sm:w-auto"
              >
                {isWorking ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save Schedule & Lifecycle
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>

      {/* Confirmation Modal for Lifecycle Transitions */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent onClose={() => setConfirmModalOpen(false)}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              <DialogTitle>Confirm Publication Status Transition</DialogTitle>
            </div>
            <DialogDescription>
              You are changing the publication status of <strong>{event.title}</strong> from{" "}
              <strong>{event.publicationStatus}</strong> to{" "}
              <strong>{pendingValues?.publicationStatus}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {pendingValues?.publicationStatus === "PUBLISHED" && (
              <p>
                <strong>Going Live:</strong> The event will immediately become publicly accessible.
                Voters can view contestants and vote according to the operational schedule.
              </p>
            )}
            {pendingValues?.publicationStatus === "ARCHIVED" && (
              <p>
                <strong>Archiving:</strong> Active voting will be permanently locked. The event page
                will remain accessible in read-only mode for historical results.
              </p>
            )}
            {pendingValues?.publicationStatus === "DRAFT" && (
              <p>
                <strong>Unpublishing:</strong> The event will be hidden from public voters and will
                require a draft preview passphrase or organizer login to view.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmTransition}
              className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Confirm Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
