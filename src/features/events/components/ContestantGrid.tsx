"use client";

import Image from "next/image";
import React from "react";
import { Award, CheckCircle2, Lock, Vote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ContestantDto, EventOperationalState } from "../types";

export interface ContestantGridProps {
  contestants: ContestantDto[];
  operationalState: EventOperationalState;
  showResultsOnClose?: boolean | undefined;
  onSelectCandidate?: ((contestant: ContestantDto) => void) | undefined;
}

export function ContestantGrid({
  contestants,
  operationalState,
  showResultsOnClose = true,
  onSelectCandidate,
}: Readonly<ContestantGridProps>): React.JSX.Element {
  return (
    <section className="space-y-6" aria-label="Official Contestant Candidates">
      <div className="border-border/40 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight">
            Official Candidates ({contestants.length})
          </h2>
          <p className="text-muted-foreground text-sm">
            Explore contestant bios and vote allocations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {contestants.map((candidate) => (
          <ContestantCard
            key={candidate.id}
            contestant={candidate}
            operationalState={operationalState}
            showResultsOnClose={showResultsOnClose}
            onSelect={onSelectCandidate}
          />
        ))}
      </div>
    </section>
  );
}

export interface ContestantCardProps {
  contestant: ContestantDto;
  operationalState: EventOperationalState;
  showResultsOnClose?: boolean | undefined;
  onSelect?: ((contestant: ContestantDto) => void) | undefined;
}

export function ContestantCard({
  contestant,
  operationalState,
  showResultsOnClose = true,
  onSelect,
}: Readonly<ContestantCardProps>): React.JSX.Element {
  const isScheduled = operationalState === "Scheduled";
  const isActive = operationalState === "Active";
  const isClosed = operationalState === "Closed";

  const renderVoteButton = (): React.JSX.Element => {
    if (isActive) {
      return (
        <Button
          onClick={() => onSelect?.(contestant)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 w-full font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Vote className="mr-2 size-4" />
          Vote for #{contestant.contestantNumber}
        </Button>
      );
    }

    if (isScheduled) {
      return (
        <Button
          disabled
          variant="secondary"
          className="w-full cursor-not-allowed text-xs font-medium uppercase opacity-80"
        >
          <Lock className="mr-2 size-3.5" />
          Voting Opens Soon
        </Button>
      );
    }

    if (isClosed) {
      return (
        <Button
          disabled
          variant="outline"
          className="w-full cursor-not-allowed text-xs uppercase opacity-70"
        >
          <Lock className="mr-2 size-3.5" />
          Voting Concluded
        </Button>
      );
    }

    return (
      <Button disabled variant="secondary" className="w-full cursor-not-allowed text-xs opacity-60">
        <CheckCircle2 className="mr-2 size-3.5" />
        Draft Preview Mode
      </Button>
    );
  };

  return (
    <Card className="group border-border/60 bg-card/60 hover:border-primary/40 relative flex flex-col overflow-hidden rounded-2xl border shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Contestant Media Header */}
      <div className="bg-muted relative aspect-3/4 w-full overflow-hidden">
        <Image
          src={contestant.avatarUrl}
          alt={contestant.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="from-background/90 via-background/20 absolute inset-0 bg-linear-to-t to-transparent" />

        {/* Candidate Number Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-background/80 text-foreground border-border/50 border px-2.5 py-1 text-xs font-bold backdrop-blur-md">
            Candidate #{contestant.contestantNumber}
          </Badge>
        </div>

        {/* Closed State Final Vote Tally Overlay */}
        {isClosed && showResultsOnClose && contestant.voteCount !== null && (
          <div className="bg-background/90 border-primary/30 absolute inset-x-3 bottom-3 rounded-xl border p-2.5 text-center shadow-lg backdrop-blur-md">
            <div className="text-primary flex items-center justify-center gap-1.5 text-xs font-semibold">
              <Award className="size-4" />
              Final Verified Votes
            </div>
            <p className="text-foreground font-mono text-lg font-extrabold">
              {contestant.voteCount.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <CardContent className="flex-1 space-y-2 p-4">
        <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-lg font-bold transition-colors">
          {contestant.name}
        </h3>
        <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
          {contestant.bio}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">{renderVoteButton()}</CardFooter>
    </Card>
  );
}
