import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#F8FAFC] text-slate-900 antialiased transition-colors selection:bg-indigo-600 selection:text-white dark:bg-[#090D16] dark:text-slate-100">
      {/* Subtle Ambient Background Light */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-indigo-100/60 blur-[120px] dark:bg-indigo-950/20" />
      </div>

      {/* Main Centered Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        {/* Auth Form Card */}
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Minimal Footer */}
      <footer className="font-body relative z-10 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>© 2026 VoteSphere Inc. Secure Competition & Voting Platform.</p>
      </footer>
    </div>
  );
}
