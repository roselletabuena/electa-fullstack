import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/features/navigation";
import { HomeSearchSection } from "@/features/search";
import { HeroMarketingCard } from "@/features/marketing";
import { TrendingEventsSection } from "@/features/events";

export const metadata: Metadata = {
  title: "Electa — Trending Events | Official Event Voting Platform",
  description:
    "The official digital voting platform. Discover active events, explore contestant profiles, and cast verified free and boost votes.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Electa — Trending Events | Official Event Voting Platform",
    description:
      "The official digital voting platform. Discover active events, explore contestant profiles, and cast verified free and boost votes.",
    url: "/",
    siteName: "Electa",
    locale: "en_PH",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Electa — Trending Events | Official Event Voting Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Electa — Trending Events | Official Event Voting Platform",
    description:
      "The official digital voting platform. Discover active events, explore contestant profiles, and cast verified free and boost votes.",
    images: ["/opengraph-image"],
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors dark:bg-[#090D16]">
      <SiteHeader />
      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-7xl space-y-16 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Hero Column: Title, Subheading, Search */}
            <div className="flex flex-col items-start text-left lg:col-span-6">
              <h1 className="heading-font text-4xl font-black tracking-tight text-slate-900 uppercase sm:text-5xl lg:text-6xl dark:text-white">
                SUPPORT YOUR{" "}
                <span className="text-sky-600 dark:text-sky-400">EVENT CANDIDATES</span>
              </h1>

              <p className="font-body mt-4 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
                The official digital voting platform. Discover active events, explore contestant
                profiles, and cast verified free and boost votes.
              </p>

              <div className="mt-8 w-full">
                <HomeSearchSection />
              </div>
            </div>

            {/* Right Hero Column: Marketing Value Showcase Card */}
            <div className="w-full lg:col-span-6">
              <HeroMarketingCard />
            </div>
          </div>

          {/* Trending Events & Lifecycle Discovery Grid */}
          <div id="events">
            <TrendingEventsSection />
          </div>
        </div>
      </main>
      <SiteFooter variant="streamlined" />
    </div>
  );
}
