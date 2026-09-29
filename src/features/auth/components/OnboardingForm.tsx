"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { onboardingFormSchema, type OnboardingFormData } from "../utils/validation";
import { completeOnboardingAction } from "../actions/onboarding-action";

export const OnboardingForm: React.FC = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSkipping, setIsSkipping] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      organizationName: "",
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setErrorMessage(null);
    const result = await completeOnboardingAction({
      organizationName: data.organizationName || "",
      skip: false,
    });

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    router.push(result.redirectTo || "/dashboard");
    router.refresh();
  };

  const handleSkip = async () => {
    setErrorMessage(null);
    setIsSkipping(true);
    try {
      const result = await completeOnboardingAction({
        skip: true,
      });

      if (!result.success) {
        setErrorMessage(result.error.message);
        return;
      }

      router.push(result.redirectTo || "/dashboard");
      router.refresh();
    } finally {
      setIsSkipping(false);
    }
  };

  const isLoading = isSubmitting || isSkipping;

  return (
    <div className="w-full max-w-md rounded-none border border-slate-200/90 bg-white/95 p-7 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-9 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-950/60 dark:text-emerald-400">
          <Sparkles className="size-5" />
        </div>
        <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome to VoteSphere!
        </h1>
        <p className="font-body mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Set up your organization or committee workspace to get started.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="mb-6 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs text-slate-600 dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Launch public or gated voting competitions</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Live analytics, voter fraud protection & audits</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="organizationName"
            className="font-heading mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Organization / Committee Name{" "}
            <span className="font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Building2 className="size-4" />
            </div>
            <input
              id="organizationName"
              type="text"
              placeholder="e.g. Apex Pageantry & Events"
              disabled={isLoading}
              {...register("organizationName")}
              className="font-body w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pr-3 pl-9 text-xs text-slate-900 transition placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/15 focus:outline-hidden sm:text-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-slate-950"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="font-heading mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 active:scale-98 disabled:opacity-50 sm:text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Saving details...</span>
            </>
          ) : (
            <>
              <span>Save & Continue to Dashboard</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          disabled={isLoading}
          className="font-body flex w-full cursor-pointer items-center justify-center py-2 text-xs font-medium text-slate-500 transition hover:text-slate-800 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
        >
          {isSkipping ? "Skipping..." : "Skip for now, I'll set this up later"}
        </button>
      </form>
    </div>
  );
};
