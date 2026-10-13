-- AlterTable
ALTER TABLE "Event" ADD COLUMN "isFreeVotingOnly" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN "ballotSubmissionId" TEXT;

-- CreateTable
CREATE TABLE "BallotSubmission" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BallotSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BallotSubmission_eventId_voterId_key" ON "BallotSubmission"("eventId", "voterId");

-- CreateIndex
CREATE INDEX "BallotSubmission_eventId_idx" ON "BallotSubmission"("eventId");

-- CreateIndex
CREATE INDEX "BallotSubmission_voterId_idx" ON "BallotSubmission"("voterId");

-- CreateIndex
CREATE INDEX "Vote_ballotSubmissionId_idx" ON "Vote"("ballotSubmissionId");

-- AddForeignKey
ALTER TABLE "BallotSubmission" ADD CONSTRAINT "BallotSubmission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_ballotSubmissionId_fkey" FOREIGN KEY ("ballotSubmissionId") REFERENCES "BallotSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
