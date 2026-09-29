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
import { GoogleSignInButton } from "./GoogleSignInButton";

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      <GoogleSignInButton label="Sign up with Google" disabled={isSubmitting} />

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
          disabled={isSubmitting}
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
