"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, UserX, ArrowRight, LockKeyhole } from "lucide-react";

function LoginForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTarget = searchParams.get("redirect") || "/events/miss-visayas-2026/settings";

  const handleSetSession = (session: { userId: string; email: string; role?: string } | null) => {
    if (session) {
      const serialized = encodeURIComponent(JSON.stringify(session));
      document.cookie = `electa_auth_session=${serialized}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = "electa_auth_session=; path=/; max-age=0; SameSite=Lax";
    }
    router.push(redirectTarget);
    router.refresh();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F172A]/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sign In to Electa</h1>
          <p className="mt-1 text-sm text-slate-400">
            Select a test profile to authenticate and continue to your destination.
          </p>
          {redirectTarget && (
            <div className="mt-3 rounded-lg bg-slate-900/60 px-3 py-1.5 font-mono text-xs text-slate-400">
              Redirect: <span className="text-violet-300">{redirectTarget}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              handleSetSession({
                userId: "usr_organizer_mock_01",
                email: "organizer@electa.ph",
                role: "ORGANIZER",
              })
            }
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-left transition hover:border-emerald-500/60 hover:bg-emerald-900/40"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Authorized Organizer (Owner)
              </div>
              <p className="mt-0.5 font-mono text-xs text-slate-400">
                usr_organizer_mock_01 (organizer@electa.ph)
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-400" />
          </button>

          <button
            type="button"
            onClick={() =>
              handleSetSession({
                userId: "usr_other_user_99",
                email: "other.user@example.com",
                role: "USER",
              })
            }
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 text-left transition hover:border-amber-500/60 hover:bg-amber-900/40"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                <UserX className="h-4 w-4" />
                Unauthorized User (Non-Owner)
              </div>
              <p className="mt-0.5 font-mono text-xs text-slate-400">
                usr_other_user_99 (other.user@example.com)
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={() => handleSetSession(null)}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-left transition hover:border-slate-600 hover:bg-slate-800/80"
          >
            <div>
              <div className="text-sm font-medium text-slate-300">
                Clear Session (Unauthenticated)
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Removes cookie and tests login redirect
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
