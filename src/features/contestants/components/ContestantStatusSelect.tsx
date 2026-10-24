"use client";

import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContestantStatus } from "../types";

export interface ContestantStatusSelectProps {
  readonly status: ContestantStatus;
  readonly contestantId?: string;
  readonly contestantName?: string;
  readonly onStatusChange: (newStatus: ContestantStatus) => void | Promise<void>;
  readonly disabled?: boolean;
  readonly className?: string;
}

interface StatusOptionConfig {
  value: ContestantStatus;
  label: string;
  description: string;
  dotColor: string;
  badgeClasses: string;
  activeClasses: string;
  hoverClasses: string;
  checkColor: string;
}

const STATUS_CONFIGS: Record<ContestantStatus, StatusOptionConfig> = {
  ACTIVE: {
    value: "ACTIVE",
    label: "ACTIVE",
    description: "Eligible for votes",
    dotColor: "bg-emerald-500",
    badgeClasses:
      "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/50",
    activeClasses: "bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
    hoverClasses:
      "hover:bg-emerald-50/80 hover:text-emerald-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200",
    checkColor: "text-emerald-700 dark:text-emerald-400",
  },
  HIDDEN: {
    value: "HIDDEN",
    label: "HIDDEN",
    description: "Concealed from public",
    dotColor: "bg-slate-400 dark:bg-slate-500",
    badgeClasses:
      "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200/80 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60",
    activeClasses: "bg-slate-100/90 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
    hoverClasses:
      "hover:bg-slate-100/80 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-slate-100",
    checkColor: "text-slate-700 dark:text-slate-300",
  },
  WITHDRAWN: {
    value: "WITHDRAWN",
    label: "WITHDRAWN",
    description: "Disqualified / removed",
    dotColor: "bg-rose-500",
    badgeClasses:
      "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100/80 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/50",
    activeClasses: "bg-rose-50/70 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200",
    hoverClasses:
      "hover:bg-rose-50/80 hover:text-rose-900 dark:hover:bg-rose-950/40 dark:hover:text-rose-200",
    checkColor: "text-rose-700 dark:text-rose-400",
  },
};

const OPTIONS: StatusOptionConfig[] = [
  STATUS_CONFIGS.ACTIVE,
  STATUS_CONFIGS.HIDDEN,
  STATUS_CONFIGS.WITHDRAWN,
];

export function ContestantStatusSelect({
  status,
  contestantId,
  contestantName,
  onStatusChange,
  disabled = false,
  className,
}: Readonly<ContestantStatusSelectProps>): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const currentConfig = STATUS_CONFIGS[status] ?? STATUS_CONFIGS.ACTIVE;

  // Reposition drop direction based on viewport space
  const openMenu = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 180 && rect.top > 180);
    }
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [disabled, isOpen, closeMenu, openMenu]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  // Focus management when menu opens
  useEffect(() => {
    if (isOpen) {
      const selectedIndex = OPTIONS.findIndex((opt) => opt.value === status);
      const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
      requestAnimationFrame(() => {
        optionRefs.current[targetIndex]?.focus();
      });
    }
  }, [isOpen, status]);

  // Keyboard navigation within listbox and trigger
  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openMenu();
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      closeMenu();
      triggerRef.current?.focus();
      return;
    }

    const currentIndex = optionRefs.current.findIndex((el) => el === document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = currentIndex < OPTIONS.length - 1 ? currentIndex + 1 : 0;
      optionRefs.current[nextIndex]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : OPTIONS.length - 1;
      optionRefs.current[prevIndex]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      optionRefs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      optionRefs.current[OPTIONS.length - 1]?.focus();
    }
  };

  const handleSelect = async (newStatus: ContestantStatus) => {
    closeMenu();
    triggerRef.current?.focus();
    if (newStatus !== status) {
      await onStatusChange(newStatus);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        data-contestant-id={contestantId}
        aria-label={
          contestantName
            ? `Change status for ${contestantName}, current status: ${currentConfig.label}`
            : `Change status, current status: ${currentConfig.label}`
        }
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-all duration-150 select-none",
          "focus-visible:ring-1 focus-visible:ring-sky-600 focus-visible:outline-none",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          currentConfig.badgeClasses,
        )}
      >
        {disabled ? (
          <Loader2 className="size-3 animate-spin text-current" aria-hidden="true" />
        ) : (
          <span
            className={cn("size-1.5 shrink-0 rounded-none", currentConfig.dotColor)}
            aria-hidden="true"
          />
        )}
        <span>{currentConfig.label}</span>
        <ChevronDown
          className={cn(
            "size-3 shrink-0 text-current transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-label="Contestant status options"
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            "animate-in fade-in-0 zoom-in-95 absolute z-50 w-48 rounded-none border border-slate-300 bg-white py-1 shadow-xl transition-all duration-150 dark:border-slate-800 dark:bg-[#0d1424]",
            dropUp ? "bottom-[calc(100%+4px)] left-0" : "top-[calc(100%+4px)] left-0",
          )}
        >
          <div className="border-b border-slate-100 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800/80 dark:text-slate-400">
            Set Status
          </div>

          <div className="space-y-0.5 p-1">
            {OPTIONS.map((opt, index) => {
              const isSelected = opt.value === status;
              return (
                <button
                  key={opt.value}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "group flex w-full cursor-pointer items-center justify-between rounded-none px-2.5 py-1.5 text-left font-mono text-[11px] font-bold tracking-wider uppercase transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-600",
                    isSelected
                      ? cn(opt.activeClasses)
                      : cn("text-slate-700 dark:text-slate-300", opt.hoverClasses),
                  )}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("size-2 shrink-0 rounded-none", opt.dotColor)}
                        aria-hidden="true"
                      />
                      <span>{opt.label}</span>
                    </div>
                    <span className="pl-4 font-sans text-[10px] font-normal tracking-normal text-slate-500 normal-case dark:text-slate-400">
                      {opt.description}
                    </span>
                  </div>
                  {isSelected && (
                    <Check
                      className={cn("ml-2 size-3.5 shrink-0", opt.checkColor)}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
