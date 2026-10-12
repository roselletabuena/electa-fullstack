import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DEFAULT_SITE_FOOTER_CONFIG } from "../utils/footer-config";
import type { SiteFooterProps } from "../types";

export function SiteFooter({
  className,
  config = DEFAULT_SITE_FOOTER_CONFIG,
  variant = "default",
}: Readonly<SiteFooterProps>) {
  const { brand, sections, legal } = config;

  if (variant === "streamlined") {
    return (
      <footer
        role="contentinfo"
        aria-label="Site Footer"
        className={cn(
          "w-full border-t border-slate-800 bg-[#0F172A] text-slate-400 transition-colors",
          className,
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <Link
            href={brand.homeHref}
            className="group inline-flex items-center gap-3 transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-sky-400"
            aria-label="Electa - Home"
          >
            <Image
              src={brand.logoSrc}
              alt="Electa Logo"
              width={24}
              height={30}
              className="transition-transform group-hover:scale-105"
              priority={false}
            />
            <div className="flex flex-col">
              <span className="font-heading text-xl leading-none font-black tracking-tight text-white select-none">
                {brand.title}
              </span>
              <span className="font-heading mt-1 text-[9px] font-extrabold tracking-widest text-sky-400 uppercase select-none">
                {brand.tagline}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <p className="font-mono text-xs tracking-tight text-slate-400 select-none">
              {legal.copyright}
            </p>
            <div className="flex items-center border-l border-slate-800 pl-4 sm:pl-6">
              <ThemeToggle variant="ghost" className="text-slate-200 hover:text-white" />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      role="contentinfo"
      aria-label="Site Footer"
      className={cn(
        "w-full border-t border-slate-800 bg-[#0F172A] text-slate-300 transition-colors",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Main Footer Directory Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6 lg:gap-12">
          {/* Brand Identity Column (Spans 2 columns on desktop) */}
          <div className="flex flex-col space-y-4 lg:col-span-2">
            <Link
              href={brand.homeHref}
              className="group inline-flex items-center gap-3 transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-sky-400"
              aria-label="Electa - Home"
            >
              <Image
                src={brand.logoSrc}
                alt="Electa Logo"
                width={28}
                height={34}
                className="transition-transform group-hover:scale-105"
                priority={false}
              />
              <div className="flex flex-col">
                <span className="font-heading text-2xl leading-none font-black tracking-tight text-white select-none">
                  {brand.title}
                </span>
                <span className="font-heading mt-1 text-[10px] font-extrabold tracking-widest text-sky-400 uppercase select-none">
                  {brand.tagline}
                </span>
              </div>
            </Link>

            <p className="font-body max-w-sm text-sm leading-relaxed text-slate-400">
              {brand.description}
            </p>

            {/* Operational Status Pill */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-none border border-slate-800 bg-slate-900/90 px-3 py-1.5 font-mono text-[11px] tracking-wider text-slate-300 uppercase shadow-xs">
                <span
                  className="h-2 w-2 rounded-none bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  aria-hidden="true"
                />
                <span>{legal.statusText}</span>
              </div>
            </div>
          </div>

          {/* Directory Columns (Spans 4 columns on desktop) */}
          <nav
            aria-label="Footer Directory"
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-4"
          >
            {sections.map((section) => (
              <div key={section.id} className="flex flex-col space-y-3">
                <h3 className="font-heading text-xs font-black tracking-widest text-slate-100 uppercase">
                  {section.title}
                </h3>
                <ul className="flex flex-col space-y-1">
                  {section.links.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        aria-label={link.ariaLabel || link.label}
                        target={link.isExternal ? "_blank" : undefined}
                        rel={link.isExternal ? "noopener noreferrer" : undefined}
                        className="font-body inline-flex min-h-11 items-center text-sm text-slate-300 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-sky-400"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Legal, Copyright & Audit Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 sm:flex-row">
          <p className="font-mono text-xs tracking-tight text-slate-400 select-none">
            {legal.copyright}
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <ThemeToggle variant="ghost" className="text-slate-200 hover:text-white" />
          </div>
        </div>
      </div>
    </footer>
  );
}
