"use client";

import React, { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock,
  Globe,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
  Archive,
  FileEdit,
  Save,
  Trash2,
  Info,
} from "lucide-react";
import { CopySlugButton } from "./CopySlugButton";
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
  type ScheduleLifecycleFormInput,
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
    dotClass: string;
  }
> = {
  DRAFT: {
    label: "Draft",
    description: "Unpublished. Private to organizers or reviewers with preview passphrase.",
    icon: FileEdit,
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    dotClass: "bg-amber-500",
  },
  PUBLISHED: {
    label: "Published",
    description: "Live to the public. Voting opens and closes per operational schedule.",
    icon: Globe,
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
  },
  ARCHIVED: {
    label: "Archived",
    description: "Concluded. Voting is locked permanently. Results visible in read-only mode.",
    icon: Archive,
    badgeClass:
      "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dotClass: "bg-slate-500",
  },
};

function formatForDateTimeInput(dateVal: Date | string): string {
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "";
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
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  const diffMs = end - start;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0 || days === 0) parts.push(`${hours} hr${hours !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

function applyServerFieldErrors(
  fieldErrors: Record<string, string[]> | undefined,
  setError: (
    field: keyof ScheduleLifecycleFormValues,
    error: { type: string; message: string },
  ) => void,
): void {
  if (!fieldErrors) return;
  for (const [field, messages] of Object.entries(fieldErrors)) {
    const firstMessage = messages?.[0];
    if (firstMessage) {
      setError(field as keyof ScheduleLifecycleFormValues, {
        type: "server",
        message: firstMessage,
      });
    }
  }
}

function resolveUpdatedPassphraseState(
  currentHasPassphrase: boolean,
  values: ScheduleLifecycleFormValues,
): boolean {
  if (values.clearDraftPassphrase) {
    return false;
  }
  if (values.draftPassphrase && values.draftPassphrase.trim().length > 0) {
    return true;
  }
  return currentHasPassphrase;
}

interface StatusAlertBannerProps {
  statusMessage: {
    type: "success" | "error";
    message: string;
  } | null;
}

function StatusAlertBanner({
  statusMessage,
}: Readonly<StatusAlertBannerProps>): React.JSX.Element | null {
  if (!statusMessage) return null;

  const isSuccess = statusMessage.type === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-none border p-4 text-sm transition-all",
        isSuccess
          ? "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "border-red-200 bg-red-50/80 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-400" />
      )}
      <div className="flex-1 font-medium">{statusMessage.message}</div>
    </div>
  );
}

interface PassphraseStatusBadgeProps {
  hasActivePassphrase: boolean;
}

function PassphraseStatusBadge({
  hasActivePassphrase,
}: Readonly<PassphraseStatusBadgeProps>): React.JSX.Element {
  if (hasActivePassphrase) {
    return (
      <Badge
        variant="outline"
        className="rounded-none border-amber-300 bg-amber-50 font-mono text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
      >
        <span className="flex items-center gap-1">
          <Lock className="size-3" /> Passphrase Set
        </span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="rounded-none border-slate-300 bg-slate-50 font-mono text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
    >
      <span className="flex items-center gap-1">
        <Unlock className="size-3" /> No Passphrase
      </span>
    </Badge>
  );
}

interface StatusTransitionNoteProps {
  status: EventPublicationStatus | undefined;
}

function StatusTransitionNote({
  status,
}: Readonly<StatusTransitionNoteProps>): React.JSX.Element | null {
  if (status === "PUBLISHED") {
    return (
      <p>
        <strong>Going Live:</strong> The event will immediately become publicly accessible. Voters
        can view contestants and vote according to the operational schedule.
      </p>
    );
  }
  if (status === "ARCHIVED") {
    return (
      <p>
        <strong>Archiving:</strong> Active voting will be permanently locked. The event page will
        remain accessible in read-only mode for historical results.
      </p>
    );
  }
  if (status === "DRAFT") {
    return (
      <p>
        <strong>Unpublishing:</strong> The event will be hidden from public voters and will require
        a draft preview passphrase or organizer login to view.
      </p>
    );
  }
  return null;
}

interface LifecycleConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  currentStatus: EventPublicationStatus;
  targetStatus: EventPublicationStatus | undefined;
  onConfirm: () => void;
}

function LifecycleConfirmModal({
  open,
  onOpenChange,
  eventTitle,
  currentStatus,
  targetStatus,
  onConfirm,
}: Readonly<LifecycleConfirmModalProps>): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            <DialogTitle>Confirm Publication Status Transition</DialogTitle>
          </div>
          <DialogDescription>
            You are changing the publication status of <strong>{eventTitle}</strong> from{" "}
            <strong>{currentStatus}</strong> to <strong>{targetStatus}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 rounded-none border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <StatusTransitionNote status={targetStatus} />
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-none font-sans text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            className="font-heading rounded-none bg-slate-900 px-4 py-2 text-xs font-extrabold tracking-wider text-white uppercase hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Confirm Transition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ScheduleLifecycleForm({
  event,
  className,
}: Readonly<ScheduleLifecycleFormProps>): React.JSX.Element {
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
  } = useForm<ScheduleLifecycleFormInput, unknown, ScheduleLifecycleFormValues>({
    resolver: zodResolver(scheduleLifecycleFormSchema),
    defaultValues,
  });

  const watchedStartsAt = useWatch({ control, name: "startsAt" }) ?? "";
  const watchedEndsAt = useWatch({ control, name: "endsAt" }) ?? "";
  const watchedStatus = useWatch({ control, name: "publicationStatus" }) ?? "DRAFT";
  const watchedClearPassphrase = useWatch({ control, name: "clearDraftPassphrase" }) ?? false;
  const watchedReason = useWatch({ control, name: "reason" }) ?? "";

  const durationText = calculateDuration(watchedStartsAt, watchedEndsAt);
  const hasActivePassphrase = hasPassphrase && !watchedClearPassphrase;
  const draftPassphrasePlaceholder = hasActivePassphrase
    ? "Enter new passphrase to replace existing..."
    : "Set draft preview passphrase (min 4 chars)...";

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

        setHasPassphrase(resolveUpdatedPassphraseState(hasPassphrase, data));

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

        applyServerFieldErrors(response.fieldErrors, setError);
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
        <Card className="rounded-none border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <CardTitle className="font-heading text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Schedule & Publication Lifecycle
              </CardTitle>
              <CardDescription className="mt-1 font-sans text-xs text-slate-500 dark:text-slate-400">
                Configure voting start/end operational windows, publication status, and draft
                preview passphrase.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            {/* Status Alert Banner */}
            <StatusAlertBanner statusMessage={statusMessage} />

            {/* Section 1: Voting Operational Window */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-heading text-xs font-extrabold tracking-wider text-slate-900 uppercase dark:text-slate-100">
                    Operational Voting Window
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Times are in Philippine Standard Time (PST / Asia/Manila, UTC+8).
                  </p>
                </div>
                {durationText && (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-none border border-sky-300/60 bg-sky-50 px-2.5 py-1 font-mono text-xs font-semibold text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
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
                    className="font-heading text-[11px] font-extrabold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                  >
                    Voting Starts At <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="startsAt"
                    type="datetime-local"
                    {...register("startsAt")}
                    className={cn(
                      "w-full rounded-none border border-slate-300 bg-slate-50/50 px-3.5 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
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
                    className="font-heading text-[11px] font-extrabold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                  >
                    Voting Ends At (Cutoff) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="endsAt"
                    type="datetime-local"
                    {...register("endsAt")}
                    className={cn(
                      "w-full rounded-none border border-slate-300 bg-slate-50/50 px-3.5 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
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
                <h3 className="font-heading text-xs font-extrabold tracking-wider text-slate-900 uppercase dark:text-slate-100">
                  Publication Status
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
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
                        "flex flex-col items-start gap-2 rounded-none border p-4 text-left transition-all focus:outline-hidden focus-visible:ring-1 focus-visible:ring-sky-500",
                        isSelected
                          ? "border-sky-600 bg-sky-50/60 shadow-xs ring-1 ring-sky-600 dark:border-sky-500 dark:bg-sky-950/40 dark:ring-sky-500"
                          : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60",
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={cn(
                              "size-4",
                              isSelected
                                ? "text-sky-600 dark:text-sky-400"
                                : "text-slate-400 dark:text-slate-500",
                            )}
                          />
                          <span
                            className={cn(
                              "font-heading text-xs font-bold tracking-wide uppercase",
                              isSelected
                                ? "text-slate-950 dark:text-white"
                                : "text-slate-800 dark:text-slate-200",
                            )}
                          >
                            {config.label}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="size-2 rounded-none bg-sky-600 dark:bg-sky-400" />
                        )}
                      </div>
                      <p className="font-sans text-xs leading-relaxed text-slate-500 dark:text-slate-400">
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
                  <h3 className="font-heading text-xs font-extrabold tracking-wider text-slate-900 uppercase dark:text-slate-100">
                    Draft Review Passphrase
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Allows invited reviewers (sponsors, contestants, judges) to inspect the event
                    page while in Draft mode.
                  </p>
                </div>

                <PassphraseStatusBadge hasActivePassphrase={hasActivePassphrase} />
              </div>

              <div className="space-y-3 rounded-none border border-slate-300 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <input
                      id="draftPassphrase"
                      type={showPassword ? "text" : "password"}
                      placeholder={draftPassphrasePlaceholder}
                      {...register("draftPassphrase")}
                      className={cn(
                        "w-full rounded-none border border-slate-300 bg-white py-2 pr-10 pl-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
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

                  {hasActivePassphrase && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setValue("clearDraftPassphrase", true, { shouldDirty: true });
                        setValue("draftPassphrase", "", { shouldDirty: true });
                      }}
                      className="gap-1.5 rounded-none border-red-200 font-sans text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="size-3.5" />
                      Remove Passphrase
                    </Button>
                  )}

                  {watchedClearPassphrase && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-red-600 dark:text-red-400">
                        Passphrase marked for removal
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setValue("clearDraftPassphrase", false, { shouldDirty: true })
                        }
                        className="rounded-none text-xs font-semibold text-slate-500"
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

                {/* Organizer Testing Guidance Callout */}
                <div className="flex flex-col gap-3 rounded-none border border-sky-200 bg-sky-50/60 p-3.5 text-xs text-sky-900 sm:flex-row sm:items-center sm:justify-between dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200">
                  <div className="flex items-start gap-2.5">
                    <Info className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-400" />
                    <div className="space-y-0.5">
                      <p className="font-heading font-extrabold tracking-wider text-sky-950 uppercase dark:text-sky-100">
                        Organizer Preview Note
                      </p>
                      <p className="leading-relaxed text-sky-800 dark:text-sky-300">
                        Because you are logged in as the event organizer, your session automatically
                        bypasses this passphrase. To test guest reviewer access, open the event link
                        in an Incognito / Private window.
                      </p>
                    </div>
                  </div>
                  <CopySlugButton
                    slug={event.slug}
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-none border-sky-300 bg-white text-xs font-semibold text-sky-800 hover:bg-sky-50 dark:border-sky-800 dark:bg-slate-900 dark:text-sky-300"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Reason for Adjustment */}
            <div className="space-y-1.5 border-t border-slate-100 pt-6 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reason"
                  className="font-heading text-[11px] font-extrabold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                >
                  Reason for Adjustment{" "}
                  <span className="font-sans font-normal text-slate-400 lowercase">(optional)</span>
                </label>
                <span
                  className={cn(
                    "font-mono text-[11px] font-medium",
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
                  "w-full resize-none rounded-none border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
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
                  className="gap-1.5 rounded-none font-sans text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
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
                className="font-heading w-full gap-2 rounded-none bg-slate-900 px-5 py-2.5 text-xs font-extrabold tracking-widest text-white uppercase shadow-xs transition hover:bg-slate-800 sm:w-auto dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
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
      <LifecycleConfirmModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        eventTitle={event.title}
        currentStatus={event.publicationStatus}
        targetStatus={pendingValues?.publicationStatus}
        onConfirm={handleConfirmTransition}
      />
    </div>
  );
}
