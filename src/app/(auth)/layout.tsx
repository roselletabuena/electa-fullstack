import React from "react";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#F8FAFC] text-slate-900 antialiased transition-colors selection:bg-sky-600 selection:text-white dark:bg-[#090D16] dark:text-slate-100">
      {/* Subtle Ambient Background Light */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 size-150 -translate-x-1/2 rounded-full bg-sky-100/50 blur-[120px] dark:bg-sky-950/20" />
      </div>

      {/* Main Centered Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        {/* Auth Form Card */}
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-6 text-center font-sans text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 Electa. The Premier Pageant Voting & Event Management Platform.</p>
      </footer>
    </div>
  );
}
