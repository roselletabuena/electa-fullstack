import { SiteHeader } from "@/features/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors dark:bg-[#090D16]">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="card-style max-w-lg p-8">
          <h1 className="heading-font text-3xl font-extrabold text-slate-900 dark:text-white">
            Electa
          </h1>
          <p className="font-body mt-3 text-sm text-slate-600 dark:text-slate-400">
            Luminous Opal Light Design Tokens loaded. Default mode is Light with Dark mode support.
          </p>
          <div className="mt-6 flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </main>
    </div>
  );
}
