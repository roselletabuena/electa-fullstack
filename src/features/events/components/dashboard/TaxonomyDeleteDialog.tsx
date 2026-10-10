"use client";

import React from "react";
import { AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DeletionTarget {
  type: "division" | "awardCategory";
  id: string;
  name: string;
  contestantCount: number;
}

export interface TaxonomyDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  target: DeletionTarget | null;
  isDeleting: boolean;
}

export function TaxonomyDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  target,
  isDeleting,
}: Readonly<TaxonomyDeleteDialogProps>): React.JSX.Element {
  if (!target) {
    return <></>;
  }

  const isBlocked = (target.contestantCount ?? 0) > 0;
  const isDivision = target.type === "division";
  const typeLabel = isDivision ? "Division" : "Award Category";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent
        onClose={isDeleting ? undefined : onClose}
        className="max-w-md rounded-xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={
                isBlocked
                  ? "flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                  : "flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
              }
            >
              {isBlocked ? (
                <ShieldAlert className="size-5" />
              ) : (
                <AlertTriangle className="size-5" />
              )}
            </div>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isBlocked ? `Cannot Delete ${typeLabel}` : `Delete ${typeLabel}?`}
            </DialogTitle>
          </div>

          <DialogDescription className="pt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {isBlocked ? (
              <span className="space-y-2">
                <span className="block">
                  <strong>&quot;{target.name}&quot;</strong> currently has{" "}
                  <strong>
                    {target.contestantCount} registered contestant
                    {target.contestantCount > 1 ? "s" : ""}
                  </strong>
                  .
                </span>
                <span className="block font-medium text-amber-700 dark:text-amber-300">
                  To safeguard competition integrity, you must reassign or remove all contestants
                  from this {typeLabel.toLowerCase()} before deleting it.
                </span>
              </span>
            ) : (
              <span>
                Are you sure you want to delete <strong>&quot;{target.name}&quot;</strong>? This
                action cannot be undone.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2">
          {isBlocked ? (
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Understood
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" disabled={isDeleting} onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={async (e) => {
                  e.preventDefault();
                  await onConfirm();
                }}
                className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
