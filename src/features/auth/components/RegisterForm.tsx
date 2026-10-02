"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { registerUserSchema, type RegisterFormData } from "../utils/validation";
import { registerUserAction } from "../actions/register-action";
import { GoogleSignInButton } from "./GoogleSignInButton";

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || searchParams.get("redirect") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      organizationName: "",
      returnTo,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    const result = await registerUserAction({
      name: data.name,
      email: data.email,
      password: data.password,
      organizationName: data.organizationName,
      returnTo,
    });

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    router.push(result.redirectTo || "/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md rounded-none border border-slate-300 bg-white p-7 shadow-sm transition-all sm:p-9 dark:border-slate-800 dark:bg-[#0d1424]">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex size-11 items-center justify-center rounded-none bg-sky-50 text-sky-700 ring-1 ring-sky-500/20 dark:bg-sky-950/60 dark:text-sky-300">
          <UserPlus className="size-5" />
        </div>
        <h1 className="font-heading mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Join Electa
        </h1>
        <p className="mt-1 font-sans text-xs text-slate-600 sm:text-sm dark:text-slate-400">
          Create your universal account to vote on pageants, support contestants, and launch your
          own events.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 flex items-center gap-2.5 rounded-none border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Google Sign-Up Button */}
      <GoogleSignInButton returnTo={returnTo} label="Sign up with Google" disabled={isSubmitting} />

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300 dark:border-slate-800" />
        </div>
        <span className="relative bg-white px-3 font-sans text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:bg-[#0d1424] dark:text-slate-400">
          Or register with email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="font-heading mb-1.5 block text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-slate-300"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">
              <User className="size-4" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="Maria Santos"
              disabled={isSubmitting}
              {...register("name")}
              className={`w-full rounded-none border bg-white py-2.5 pr-3 pl-9 font-sans text-xs text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:outline-hidden sm:text-sm dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-600 ${
                errors.name
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-300 focus:border-sky-600 focus:ring-sky-600/20 dark:border-slate-700 dark:focus:border-sky-500"
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1 font-sans text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="font-heading mb-1.5 block text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-slate-300"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">
              <Mail className="size-4" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="user@electa.ph"
              disabled={isSubmitting}
              {...register("email")}
              className={`w-full rounded-none border bg-white py-2.5 pr-3 pl-9 font-sans text-xs text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:outline-hidden sm:text-sm dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-600 ${
                errors.email
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-300 focus:border-sky-600 focus:ring-sky-600/20 dark:border-slate-700 dark:focus:border-sky-500"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 font-sans text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="font-heading mb-1.5 block text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-slate-300"
          >
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">
              <Lock className="size-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              disabled={isSubmitting}
              {...register("password")}
              className={`w-full rounded-none border bg-white py-2.5 pr-10 pl-9 font-sans text-xs text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:outline-hidden sm:text-sm dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-600 ${
                errors.password
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-300 focus:border-sky-600 focus:ring-sky-600/20 dark:border-slate-700 dark:focus:border-sky-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 font-sans text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Organization Name (Optional) */}
        <div>
          <label
            htmlFor="organizationName"
            className="font-heading mb-1.5 block text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-slate-300"
          >
            Organization / Pageant Name{" "}
            <span className="font-normal text-slate-500">(Optional)</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">
              <Building2 className="size-4" />
            </div>
            <input
              id="organizationName"
              type="text"
              placeholder="e.g. Miss Universe Philippines"
              disabled={isSubmitting}
              {...register("organizationName")}
              className="w-full rounded-none border border-slate-300 bg-white py-2.5 pr-3 pl-9 font-sans text-xs text-slate-900 transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-1 focus:ring-sky-600/20 focus:outline-hidden sm:text-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-sky-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="font-heading mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-slate-900 py-3 text-xs font-extrabold tracking-widest text-white uppercase shadow-xs transition hover:bg-slate-800 active:scale-98 disabled:opacity-50 sm:text-xs dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Creating Electa Account...</span>
            </>
          ) : (
            <>
              <span>Create Electa Account</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 border-t border-slate-200 pt-5 text-center font-sans text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href={`/login${returnTo !== "/dashboard" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="font-bold text-sky-700 transition hover:underline dark:text-sky-400"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};
