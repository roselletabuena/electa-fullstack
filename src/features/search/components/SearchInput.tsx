"use client";

import React, { useRef, useImperativeHandle } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchInputProps } from "../types";

export interface SearchInputHandle {
  focus: () => void;
  blur: () => void;
}

export const SearchInput = React.forwardRef<SearchInputHandle, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      onSubmit,
      inputSize = "default",
      className,
      placeholder = "Search events, categories, and contestants...",
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (onClear) {
          onClear();
        }
        inputRef.current?.focus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (onSubmit) {
          onSubmit();
        }
      }
    };

    const sizeClasses = {
      compact: "h-9 text-xs pl-8 pr-8",
      default: "h-11 text-sm pl-10 pr-10",
      large: "h-14 text-base pl-12 pr-12",
    };

    const iconSizeClasses = {
      compact: "left-2.5 h-3.5 w-3.5",
      default: "left-3 h-4 w-4",
      large: "left-4 h-5 w-5",
    };

    return (
      <div className={cn("relative flex w-full items-center", className)}>
        <Search
          className={cn(
            "pointer-events-none absolute text-slate-500 dark:text-slate-400",
            iconSizeClasses[inputSize],
          )}
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full rounded-none border border-slate-300 bg-white font-sans text-slate-900 shadow-xs transition-colors placeholder:text-slate-500 focus-visible:border-sky-600 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#0d1424] dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:border-sky-400 dark:focus-visible:outline-sky-400",
            sizeClasses[inputSize],
          )}
          {...props}
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (onClear) onClear();
              inputRef.current?.focus();
            }}
            className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-none text-slate-400 transition-colors hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-sky-600 dark:text-slate-400 dark:hover:text-slate-200 dark:focus-visible:outline-sky-400"
            aria-label="Clear search input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
