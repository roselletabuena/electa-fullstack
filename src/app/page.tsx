import { SiteHeader, SiteFooter } from "@/features/navigation";
import { HomeSearchSection } from "@/features/search";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors dark:bg-[#090D16]">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-start px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-1 text-[11px] font-extrabold tracking-widest text-slate-800 uppercase shadow-xs dark:border-slate-800 dark:bg-white/5 dark:text-slate-200">
            <span className="h-1.5 w-1.5 bg-sky-600 dark:bg-sky-400" />
            Official Discovery Portal
          </div>

          <h1 className="heading-font mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            VOTE. ENGAGE. CELEBRATE.
          </h1>

          <p className="font-body mt-4 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
            Real-time, fraud-resistant voting engine for collegiate pageants, campus elections, and
            community awards. Find your event or favorite contestant below.
          </p>

          <div className="mt-8 flex w-full justify-center">
            <HomeSearchSection />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
