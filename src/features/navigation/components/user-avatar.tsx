"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "../utils/avatar-helper";
import type { UserAvatarProps } from "../types";

const SIZE_CLASSES = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
} as const;

export function UserAvatar({ user, size = "md", className }: Readonly<UserAvatarProps>) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const hasAvatarImage = Boolean(user?.avatarUrl) && !imageError;

  if (hasAvatarImage && user?.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt={user.name ? `${user.name}'s avatar` : "User avatar"}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setImageError(true)}
        style={{ borderRadius: "9999px" }}
        className={cn(
          "aspect-square shrink-0 rounded-full border border-slate-300 object-cover dark:border-slate-700",
          sizeClass,
          className,
        )}
      />
    );
  }

  const initials = getInitials(user?.name, user?.email);

  return (
    <div
      aria-hidden="true"
      style={{ borderRadius: "9999px" }}
      className={cn(
        "aspect-square shrink-0 rounded-full border border-slate-300 bg-slate-100 font-mono font-bold text-slate-800 select-none",
        "flex items-center justify-center transition-colors",
        "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
        sizeClass,
        className,
      )}
    >
      {initials}
    </div>
  );
}
