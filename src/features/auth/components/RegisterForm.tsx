"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { registerOrganizerSchema, type RegisterFormData } from "../utils/validation";
import { registerOrganizerAction } from "../actions/register-action";
import { loginAction } from "../actions/login-action";

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerOrganizerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      organizationName: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    const result = await registerOrganizerAction({
      name: data.name,
      email: data.email,
      password: data.password,
      organizationName: data.organizationName,
    });

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    router.push(result.redirectTo || "/dashboard");
    router.refresh();
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);
    try {
      const result = await loginAction({
        email: "organizer.google@electa.ph",
        isDemoLogin: true,
      });

      if (!result.success) {
        setErrorMessage(result.error.message);
        return;
      }

      router.push(result.redirectTo || "/dashboard");
      router.refresh();
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isGoogleSubmitting;

  return (
    <div className="w-full max-w-md rounded-none border border-slate-200/90 bg-white/95 p-7 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-9 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 dark:bg-indigo-950/60 dark:text-indigo-400">
          <UserPlus className="size-5" />
        </div>
        <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create Organizer Account
        </h1>
        <p className="font-body mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Launch and monetize your events, tournaments & awards with verified voting.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Google Sign-Up Button */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 active:scale-98 disabled:opacity-50 sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80"
      >
        {isGoogleSubmitting ? (
          <Loader2 className="size-4 animate-spin text-slate-500" />
        ) : (
          <svg className="size-4.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Sign up with Google</span>
      </button>

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <span className="font-body relative bg-white px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:bg-slate-900 dark:text-slate-500">
          Or register with email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="font-heading mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <User className="size-4" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="Maria Santos"
              disabled={isLoading}
              {...register("name")}
              className={`font-body w-full rounded-2xl border bg-slate-50/70 py-2.5 pr-3 pl-9 text-xs text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:outline-hidden sm:text-sm dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-slate-950 ${
                errors.name
                  ? "border-rose-400 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/15 dark:border-slate-800 dark:focus:border-indigo-500"
              }`}
            />
          </div>
          {errors.name && (
            <p className="font-body mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Address */}
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
              placeholder="organizer@events.ph"
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

        {/* Organization / Committee */}
        <div>
          <label
            htmlFor="organizationName"
            className="font-heading mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Organization / Committee{" "}
            <span className="font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Building2 className="size-4" />
            </div>
            <input
              id="organizationName"
              type="text"
              placeholder="e.g. National Intramurals Committee"
              disabled={isLoading}
              {...register("organizationName")}
              className="font-body w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pr-3 pl-9 text-xs text-slate-900 transition placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/15 focus:outline-hidden sm:text-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-slate-950"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="font-heading mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Password{" "}
            <span className="font-normal text-slate-400 dark:text-slate-500">
              (min 8 chars, 1 uppercase, 1 number)
            </span>
          </label>
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="font-heading mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-98 disabled:opacity-50 sm:text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Organizer Account</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div className="font-body mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Already have an organizer account?{" "}
        <Link
          href="/login"
          className="font-bold text-indigo-600 transition hover:text-indigo-500 hover:underline dark:text-indigo-400"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
};
