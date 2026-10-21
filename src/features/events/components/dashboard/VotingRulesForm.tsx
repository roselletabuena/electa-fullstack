"use client";

import React, { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, AlertCircle, CheckCircle2, RotateCcw, Loader2, Info } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  votingRulesFormSchema,
  type VotingRulesFormValues,
} from "@/lib/validations/event-voting-rules";
import { updateVotingRulesAction } from "@/features/events/actions/update-voting-rules";
import type { Event } from "@/generated/client/client";
import { cn } from "@/lib/utils";

export interface VotingRulesFormProps {
  event: Event;
  className?: string;
}

const QUOTA_OPTIONS = [1, 2, 3, 4, 5] as const;

export function VotingRulesForm({
  event,
  className,
}: Readonly<VotingRulesFormProps>): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const defaultValues: VotingRulesFormValues = {
    isFreeVotingEnabled: event.isFreeVotingEnabled ?? true,
    dailyFreeVoteLimit: event.dailyFreeVoteLimit ?? 1,
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
  } = useForm<VotingRulesFormValues>({
    resolver: zodResolver(votingRulesFormSchema),
    defaultValues,
  });

  const watchedFreeVoting = useWatch({ control, name: "isFreeVotingEnabled" }) ?? true;
  const watchedQuota = useWatch({ control, name: "dailyFreeVoteLimit" }) ?? 1;
  const watchedReason = useWatch({ control, name: "reason" }) ?? "";

  const onSubmit = (data: VotingRulesFormValues) => {
    setStatusMessage(null);

    startTransition(async () => {
      const response = await updateVotingRulesAction(event.slug, data);

      if (response.success) {
        setStatusMessage({
          type: "success",
          message: response.message || "Voting rules updated successfully!",
        });
        reset(data); // Rebase dirty state to new values
      } else {
        setStatusMessage({
          type: "error",
          message: response.error || "Failed to update voting rules.",
        });

        if (response.fieldErrors) {
          for (const [field, messages] of Object.entries(response.fieldErrors)) {
            if (messages?.[0]) {
              setError(field as keyof VotingRulesFormValues, {
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
        <Card className="rounded-none border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <CardTitle className="font-heading text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Voting Rules & Daily Quota
              </CardTitle>
              <CardDescription className="mt-1 font-sans text-xs text-slate-500 dark:text-slate-400">
                Configure free vote allowances per 24-hour cycle and toggle free daily voting.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            {/* Status Alert Banner */}
            {statusMessage && (
              <div
                role="status"
                aria-live="polite"
                className={cn(
                  "flex items-start gap-3 rounded-none border p-4 text-xs font-medium transition-all",
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
                <div className="flex-1 font-medium">{statusMessage.message}</div>
              </div>
            )}

            {/* Toggle 1: Free Daily Voting Enable/Disable */}
            <div className="rounded-none border border-slate-300 bg-slate-50/40 p-5 transition-colors dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <label
                    htmlFor="free-voting-switch"
                    className="font-heading text-xs font-extrabold tracking-wider text-slate-900 uppercase dark:text-slate-100"
                  >
                    Enable Free Daily Voting
                  </label>
                  <p className="font-sans text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    When enabled, eligible voters can cast free daily votes up to the quota limit.
                    Turn OFF during Grand Finals to enforce paid boost voting only.
                  </p>
                </div>

                <button
                  type="button"
                  id="free-voting-switch"
                  role="switch"
                  aria-checked={watchedFreeVoting}
                  onClick={() =>
                    setValue("isFreeVotingEnabled", !watchedFreeVoting, { shouldDirty: true })
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-1 focus-visible:ring-sky-500",
                    watchedFreeVoting
                      ? "bg-slate-900 dark:bg-sky-500"
                      : "bg-slate-300 dark:bg-slate-700",
                  )}
                >
                  <span className="sr-only">Toggle free daily voting</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none inline-block size-5 transform rounded-none bg-white shadow-xs transition duration-200 ease-in-out",
                      watchedFreeVoting ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </div>

              {!watchedFreeVoting && (
                <div className="mt-4 flex items-start gap-2.5 rounded-none border border-amber-300/50 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                  <Info className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p>
                    <strong>Grand Finals / Paid Mode:</strong> Free vote buttons will be disabled on
                    public contestant profiles, and voters will be prompted with paid boost packages
                    only.
                  </p>
                </div>
              )}
            </div>

            {/* Quota Selector: Daily Free Vote Limit */}
            <div
              className={cn(
                "space-y-3 transition-opacity duration-200",
                !watchedFreeVoting && "pointer-events-none opacity-50",
              )}
            >
              <div>
                <label className="font-heading text-xs font-extrabold tracking-wider text-slate-900 uppercase dark:text-slate-100">
                  Daily Free Vote Quota per Voter
                </label>
                <p className="mt-0.5 font-sans text-xs text-slate-500 dark:text-slate-400">
                  Select how many free votes each voter is allowed per 24-hour cycle (1 to 5).
                </p>
              </div>

              {/* Segmented Option Cards */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {QUOTA_OPTIONS.map((quota) => {
                  const isSelected = watchedQuota === quota;
                  return (
                    <button
                      key={quota}
                      type="button"
                      disabled={!watchedFreeVoting}
                      onClick={() =>
                        setValue("dailyFreeVoteLimit", quota, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "flex flex-col items-center justify-center rounded-none border p-3 text-center transition-all focus:outline-hidden focus-visible:ring-1 focus-visible:ring-sky-500",
                        isSelected
                          ? "border-sky-600 bg-sky-50/70 text-slate-950 shadow-xs ring-1 ring-sky-600 dark:border-sky-500 dark:bg-sky-950/50 dark:text-white dark:ring-sky-500"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/60",
                      )}
                    >
                      <span className="font-heading text-base font-black sm:text-lg">{quota}</span>
                      <span className="font-sans text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {quota === 1 ? "Vote (Default)" : "Votes"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {errors.dailyFreeVoteLimit && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  <AlertCircle className="size-3.5" />
                  {errors.dailyFreeVoteLimit.message}
                </p>
              )}
            </div>

            {/* Reason for Change (Audit Note) */}
            <div className="space-y-1.5">
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
                placeholder="e.g. Adjusted daily vote limit for preliminary round engagement..."
                {...register("reason")}
                className={cn(
                  "w-full resize-none rounded-none border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
                  errors.reason && "border-red-500 focus:border-red-500 focus:ring-red-500",
                )}
              />
              {errors.reason && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  <AlertCircle className="size-3.5" />
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
                  onClick={() => reset(defaultValues)}
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
                    Saving Rules...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Save Voting Rules
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
