"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  X,
} from "lucide-react";
import { loginSchema, type LoginFormData } from "../utils/validation";
import { loginAction } from "../actions/login-action";
import { GoogleSignInButton } from "./GoogleSignInButton";

function getUrlErrorMessage(urlError: string | null, urlErrorReason: string | null): string | null {
  if (!urlError) return null;
  if (urlError === "auth_cancelled") {
    return "Google sign-in was cancelled. Please try again when ready.";
  }
  if (urlError === "invalid_state") {
    return "Authentication session expired or security state check failed. Please try again.";
  }
  if (urlError === "token_exchange_failed") {
    return "Unable to exchange tokens with the identity provider. Please try again.";
  }
  return urlErrorReason
    ? `Sign-in error: ${urlErrorReason}`
    : "An authentication error occurred. Please try again.";
}

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || searchParams.get("redirect") || "/dashboard";
  const urlError = searchParams.get("error");
  const urlErrorReason = searchParams.get("reason");

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [dismissedUrlError, setDismissedUrlError] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  const urlErrorMessage = dismissedUrlError ? null : getUrlErrorMessage(urlError, urlErrorReason);
  const errorMessage = formError || urlErrorMessage;

  const clearErrors = () => {
    setFormError(null);
    setDismissedUrlError(true);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      returnTo,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearErrors();
    const result = await loginAction({
      email: data.email,
      password: data.password,
      returnTo,
    });

    if (!result.success) {
      setFormError(result.error.message);
      return;
    }

    router.push(result.redirectTo || "/dashboard");
    router.refresh();
  };

  const handleDemoLogin = async () => {
    clearErrors();
    setIsDemoSubmitting(true);
    try {
      const result = await loginAction({
        email: "organizer@electa.ph",
        isDemoLogin: true,
        returnTo,
      });

      if (!result.success) {
        setFormError(result.error.message);
        return;
      }

      router.push(result.redirectTo || "/dashboard");
      router.refresh();
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isDemoSubmitting;

  return (
    <div className="w-full max-w-md rounded-none border border-slate-200/90 bg-white/95 p-7 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-9 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 dark:bg-indigo-950/60 dark:text-indigo-400">
          <Lock className="size-5" />
        </div>
        <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Organizer Sign In
        </h1>
        <p className="font-body mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Access your event command center, tallies & analytics.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 flex items-start justify-between gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={clearErrors}
            className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Google 1-Click Sign-In Button */}
      <GoogleSignInButton returnTo={returnTo} disabled={isLoading} />

      {/* 1-Click Quick Demo Login Card */}
      <div className="mt-4 rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-50/90 via-purple-50/50 to-sky-50/80 p-4 dark:border-indigo-900/60 dark:from-slate-800/80 dark:via-indigo-950/40 dark:to-slate-800/80">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="font-heading text-xs font-bold text-slate-900 dark:text-white">
                Quick Demo Access
              </p>
              <p className="font-body text-[11px] text-slate-500 dark:text-slate-400">
                1-click login as Alex Gonzaga
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 transition hover:scale-102 hover:bg-indigo-500 active:scale-98 disabled:opacity-50"
          >
            {isDemoSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <>
                <span>Quick Demo</span>
                <ArrowRight className="size-3" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <span className="font-body relative bg-white px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:bg-slate-900 dark:text-slate-500">
          Or sign in with email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="font-heading mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="size-4" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="organizer@electa.ph"
              disabled={isLoading}
              {...register("email")}
              className={`font-body w-full rounded-2xl border bg-slate-50/70 py-2.5 pr-3 pl-9 text-xs text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:outline-hidden sm:text-sm dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-slate-950 ${
                errors.email
                  ? "border-rose-400 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/15 dark:border-slate-800 dark:focus:border-indigo-500"
              }`}
            />
          </div>
          {errors.email && (
            <p className="font-body mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="font-heading block text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="size-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={isLoading}
              {...register("password")}
              className={`font-body w-full rounded-2xl border bg-slate-50/70 py-2.5 pr-10 pl-9 text-xs text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:outline-hidden sm:text-sm dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-slate-950 ${
                errors.password
                  ? "border-rose-400 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/15 dark:border-slate-800 dark:focus:border-indigo-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="font-body mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isLoading}
          className="font-heading mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-98 disabled:opacity-50 sm:text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="font-body mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        New organizer?{" "}
        <Link
          href={`/register${returnTo !== "/dashboard" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="font-bold text-indigo-600 transition hover:text-indigo-500 hover:underline dark:text-indigo-400"
        >
          Register an account
        </Link>
      </div>
    </div>
  );
};
