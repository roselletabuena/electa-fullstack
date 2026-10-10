"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EventErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function EventError({ error, reset }: EventErrorProps): React.JSX.Element {
  useEffect(() => {
    console.error("Event route error:", error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="border-destructive/30 bg-card/80 w-full max-w-md space-y-6 rounded-3xl border p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="bg-destructive/10 text-destructive border-destructive/20 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border">
          <AlertTriangle className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-sm">
            We encountered an unexpected issue while loading this event. Please try again.
          </p>
        </div>
        <Button
          onClick={() => reset()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full font-semibold"
        >
          <RefreshCw className="mr-2 size-4" />
          Reload Event
        </Button>
      </div>
    </div>
  );
}
