"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getSessionAction } from "@/features/auth/actions/get-session-action";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import type { UserAccountNavProps } from "../types";

export function UserAccountNav({ user, onLogout, className }: Readonly<UserAccountNavProps>) {
  const {
    user: authUser,
    isAuthenticated: authIsAuthenticated,
    setUser,
    logout: authLogout,
  } = useAuth();

  // Support prop override for testing or SSR, fallback to global store
  const currentUser = user !== undefined ? user : authUser;
  const isAuthenticated = user !== undefined ? Boolean(user) : authIsAuthenticated;

  // Hydrate client auth store from server session cookie on mount if not provided as prop
  useEffect(() => {
    if (user === undefined && !authUser) {
      let isMounted = true;
      getSessionAction()
        .then((session) => {
          if (isMounted && session) {
            setUser(session);
          }
        })
        .catch(() => {
          // Keep guest state if unauthenticated or network error
        });

      return () => {
        isMounted = false;
      };
    }
  }, [user, authUser, setUser]);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation (Escape, ArrowDown, ArrowUp)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (!menuRef.current) return;
        event.preventDefault();

        const focusableElements = Array.from(
          menuRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );

        if (focusableElements.length === 0) return;

        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

        let nextIndex = 0;
        if (event.key === "ArrowDown") {
          nextIndex =
            currentIndex === -1 || currentIndex === focusableElements.length - 1
              ? 0
              : currentIndex + 1;
        } else {
          nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
        }

        focusableElements[nextIndex]?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = useCallback(async () => {
    setIsOpen(false);
    if (onLogout) {
      await onLogout();
      return;
    }
    await authLogout();
  }, [onLogout, authLogout]);

  // Guest State: Unauthenticated Visitor
  if (!isAuthenticated || !currentUser) {
    return (
      <Link
        href="/login"
        className={cn(
          "btn-primary font-heading inline-flex h-9 items-center justify-center rounded-none border border-slate-900 bg-slate-900 px-3 text-xs font-extrabold tracking-wider text-white shadow-xs transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-sky-600 sm:px-4 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:outline-sky-400",
          className,
        )}
        aria-label="Sign in to your account"
      >
        Sign In
      </Link>
    );
  }

  // Authenticated State: User Account Trigger & Dropdown
  const userDisplayName = currentUser.name || currentUser.email;

  return (
    <div ref={containerRef} className={cn("relative flex items-center", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`User account menu for ${userDisplayName}`}
        className="group relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400"
        style={{ borderRadius: "9999px" }}
      >
        <UserAvatar user={currentUser} size="md" className="h-9 w-9" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="User account actions"
          className="animate-in fade-in-0 zoom-in-95 absolute top-[calc(100%+0.5rem)] right-0 z-50 w-60 rounded-none border border-slate-300 bg-white py-1 text-slate-900 shadow-xl transition-all duration-150 dark:border-slate-800 dark:bg-[#0d1424] dark:text-slate-100"
        >
          {/* User Info Header */}
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="font-heading truncate text-xs font-black text-slate-900 dark:text-slate-100">
              {currentUser.name || "User"}
            </p>
            <p className="truncate font-sans text-[11px] text-slate-600 dark:text-slate-400">
              {currentUser.email}
            </p>
            {currentUser.role && (
              <span className="mt-2 inline-flex items-center rounded-none border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-slate-700 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {currentUser.role}
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <div className="py-1" role="none">
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-none px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:bg-slate-100 focus-visible:outline-none dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white dark:focus-visible:bg-slate-800/80"
            >
              <LayoutDashboard
                className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
                aria-hidden="true"
              />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Sign Out Action */}
          <div className="border-t border-slate-200 py-1 dark:border-slate-800" role="none">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-none px-4 py-2 text-left text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:bg-rose-50 focus-visible:outline-none dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:focus-visible:bg-rose-950/40"
            >
              <LogOut
                className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400"
                aria-hidden="true"
              />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
