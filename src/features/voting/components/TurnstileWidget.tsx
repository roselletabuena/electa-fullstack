"use client";

import React, { useEffect, useRef } from "react";
import { env } from "@/env";

export interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (errorCode?: string) => void;
  onExpire?: () => void;
  action?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "invisible";
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (code?: string) => void;
          "expired-callback"?: () => void;
          action?: string;
          theme?: string;
          size?: string;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onError,
  onExpire,
  action = "cast_vote",
  theme = "auto",
  size = "normal",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isMockMode =
    siteKey === "1x00000000000000000000AA" || env.NODE_ENV === "test" || siteKey.startsWith("mock");

  useEffect(() => {
    // If in dev/test mock mode, provide a mock token immediately
    if (isMockMode) {
      onVerify("mock-turnstile-token");
      return;
    }

    if (!containerRef.current) return;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return;

      try {
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
        }

        const renderOptions: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (code?: string) => void;
          "expired-callback"?: () => void;
          action?: string;
          theme?: string;
          size?: string;
        } = {
          sitekey: siteKey,
          callback: onVerify,
          action,
          theme,
          size,
        };

        if (onError) {
          renderOptions["error-callback"] = onError;
        }
        if (onExpire) {
          renderOptions["expired-callback"] = onExpire;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, renderOptions);
      } catch (err) {
        console.error("[TurnstileWidget] render error:", err);
      }
    };

    // Load Turnstile script if not already in document
    const SCRIPT_ID = "cloudflare-turnstile-script";
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => renderWidget();
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [siteKey, isMockMode, onVerify, onError, onExpire, action, theme, size]);

  if (isMockMode) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`flex min-h-[65px] items-center justify-center ${className}`}
      data-testid="turnstile-widget"
    />
  );
};
