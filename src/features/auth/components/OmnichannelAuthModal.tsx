"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import {
  requestPasswordlessOtpAction,
  verifyPasswordlessOtpAction,
} from "../actions/passwordless-actions";

export interface OmnichannelAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (() => void) | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
}

type AuthMode = "options" | "email-link" | "phone-otp" | "verify-otp";

export const OmnichannelAuthModal: React.FC<OmnichannelAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Sign In to Vote",
  subtitle = "Choose your preferred identity provider to cast your free daily votes.",
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("options");
  const [destination, setDestination] = useState("");
  const [channel, setChannel] = useState<"email" | "sms" | "whatsapp">("email");
  const [otpCode, setOtpCode] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleReset = () => {
    setMode("options");
    setDestination("");
    setOtpCode("");
    setStatusMessage("");
    setErrorMessage("");
    onClose();
  };

  const handleSocialLogin = (provider: "Google" | "Apple" | "Facebook") => {
    router.push(
      `/api/auth/cognito/initiate?provider=${provider}&returnTo=${encodeURIComponent(
        typeof window !== "undefined" ? window.location.pathname : "/events",
      )}`,
    );
  };

  const handleSendOtp = (selectedChannel: "email" | "sms" | "whatsapp") => {
    setErrorMessage("");
    setStatusMessage("");

    if (!destination.trim()) {
      setErrorMessage(
        selectedChannel === "email"
          ? "Please enter your email address."
          : "Please enter your phone number.",
      );
      return;
    }

    startTransition(async () => {
      const res = await requestPasswordlessOtpAction(selectedChannel, destination.trim());
      if (res.success) {
        setChannel(selectedChannel);
        setStatusMessage(res.message);
        setMode("verify-otp");
      } else {
        setErrorMessage(res.error || "Unable to send verification code.");
      }
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!otpCode.trim()) {
      setErrorMessage("Please enter the 6-digit code.");
      return;
    }

    startTransition(async () => {
      const res = await verifyPasswordlessOtpAction(destination.trim(), otpCode.trim());
      if (res.success) {
        setStatusMessage("Authenticated successfully!");
        setTimeout(() => {
          handleReset();
          onSuccess?.();
          router.refresh();
        }, 600);
      } else {
        setErrorMessage(res.error || "Verification failed.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={handleReset}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-indigo-200/50 bg-white p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-indigo-900/60 dark:bg-slate-900">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
            <ShieldCheck className="size-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>

        {/* Error / Status Messages */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Mode 1: Provider Selection */}
        {mode === "options" && (
          <div className="mt-6 space-y-3">
            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="dark:hover:bg-slate-750 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <svg className="size-4" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            {/* Apple Sign-In */}
            <button
              type="button"
              onClick={() => handleSocialLogin("Apple")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-900 bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:border-slate-800 dark:bg-black dark:hover:bg-slate-900"
            >
              <svg className="size-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.34-6.3-9.66-11.22-20.73-14.75-33.22-3.53-12.49-5.3-24.16-5.3-35.03 0-14.54 3.73-26.68 11.19-36.42 7.46-9.74 17.07-14.75 28.83-15.02 4.9 0 10.38 1.25 16.44 3.75 6.06 2.5 10.22 3.81 12.48 3.94 1.8.13 6.13-1.25 13-4.14 6.87-2.89 12.63-4.14 17.29-3.75 14.54.91 25.75 6.1 33.63 15.58-13.06 7.9-19.46 18.9-19.2 33 0 11.69 4.35 21.49 13.06 29.38 8.7 7.9 19.01 12.18 30.93 12.84-2.48 7.37-5.61 14.88-9.4 22.54zM119.22 31.02c0-7.37 2.65-14.34 7.96-20.91 5.3-6.58 12.04-10.11 20.21-10.11.26 1.05.39 2.11.39 3.17 0 7.37-2.78 14.47-8.35 21.31-5.56 6.84-12.28 10.51-20.21 11.02z" />
              </svg>
              <span>Continue with Apple</span>
            </button>

            {/* Facebook OAuth */}
            <button
              type="button"
              onClick={() => handleSocialLogin("Facebook")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-blue-600 bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              <span className="absolute bg-white px-3 text-[11px] font-medium tracking-wider text-slate-400 uppercase dark:bg-slate-900">
                Or passwordless
              </span>
            </div>

            {/* Email Magic Link */}
            <button
              type="button"
              onClick={() => {
                setMode("email-link");
                setChannel("email");
                setDestination("");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Mail className="size-4" />
              <span>Email Magic Link / Code</span>
            </button>

            {/* Phone OTP */}
            <button
              type="button"
              onClick={() => {
                setMode("phone-otp");
                setChannel("sms");
                setDestination("");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Phone className="size-4" />
              <span>Phone OTP (SMS / WhatsApp)</span>
            </button>
          </div>
        )}

        {/* Mode 2: Email Magic Link Form */}
        {mode === "email-link" && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                placeholder="voter@example.com"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSendOtp("email")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <span>Send Magic Link & Code</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMode("options")}
              className="w-full text-center text-xs text-slate-500 hover:underline"
            >
              ← Back to all options
            </button>
          </div>
        )}

        {/* Mode 3: Phone OTP Form */}
        {mode === "phone-otp" && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Mobile Phone Number
              </label>
              <input
                type="tel"
                placeholder="+63 917 123 4567"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSendOtp("sms")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Phone className="size-3.5" />
                <span>Via SMS</span>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSendOtp("whatsapp")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-50/50 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/50 disabled:opacity-50 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <MessageSquare className="size-3.5" />
                <span>Via WhatsApp</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setMode("options")}
              className="w-full text-center text-xs text-slate-500 hover:underline"
            >
              ← Back to all options
            </button>
          </div>
        )}

        {/* Mode 4: 6-Digit OTP Verification Form */}
        {mode === "verify-otp" && (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Enter 6-Digit Code sent to {destination}
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-center text-lg font-bold tracking-widest text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span>Confirm & Sign In</span>
              )}
            </button>
            <div className="flex justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => handleSendOtp(channel)}
                className="hover:underline"
              >
                Resend code
              </button>
              <button type="button" onClick={() => setMode("options")} className="hover:underline">
                Change method
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
