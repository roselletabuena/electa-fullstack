import type { Metadata } from "next";
import {
  Outfit,
  Sora,
  JetBrains_Mono,
  Cormorant_Garamond,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ReactQueryProvider } from "@/components/shared/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/env";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Electa | Universal Contest & Voting Engine",
  description:
    "Architectural high-fidelity voting and pageant engine designed with the Luminous Opal design system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${sora.variable} ${jetbrainsMono.variable} ${cormorantGaramond.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var stored=localStorage.getItem('electa-theme')||localStorage.getItem('votesphere-theme');if(stored==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning className="font-body flex min-h-full flex-col">
        <ThemeProvider defaultTheme="light">
          <ReactQueryProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
            <Toaster position="top-center" />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
