import React from "react";
import Link from "next/link";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ForbiddenAccessCardProps {
  eventTitle?: string;
  userEmail?: string;
}

export function ForbiddenAccessCard({
  eventTitle,
  userEmail,
}: ForbiddenAccessCardProps): React.JSX.Element {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="max-w-md border-red-200 shadow-lg dark:border-red-900/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
            <ShieldX className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="inline-block self-center rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-bold tracking-widest text-red-700 uppercase dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
            HTTP 403 Forbidden
          </div>
          <CardTitle className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            Access Denied
          </CardTitle>
          <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
            You do not have administrative permissions to view or configure settings for this event.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
          {eventTitle && (
            <div className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Target Event:
              </span>{" "}
              <span className="text-slate-900 dark:text-slate-100">{eventTitle}</span>
            </div>
          )}
          {userEmail && (
            <p className="text-center">
              Signed in as:{" "}
              <strong className="font-medium text-slate-800 dark:text-slate-200">
                {userEmail}
              </strong>
            </p>
          )}
          <p className="text-center text-slate-500">
            If you believe you should have access to this event, please sign in with the organizer
            account that created it.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Link href="/dashboard/events" className="w-full">
            <Button variant="outline" className="w-full gap-1.5 text-xs">
              <ArrowLeft className="size-3.5" />
              My Events
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="default" className="w-full gap-1.5 text-xs">
              <Home className="size-3.5" />
              Go to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
