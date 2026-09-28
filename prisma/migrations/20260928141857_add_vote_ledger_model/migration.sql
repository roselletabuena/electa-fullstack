-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('FREE', 'BOOST');

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "contestantId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "awardCategoryId" TEXT,
    "voteType" "VoteType" NOT NULL DEFAULT 'FREE',
    "voteWeight" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vote_eventId_voterId_createdAt_idx" ON "Vote"("eventId", "voterId", "createdAt");

-- CreateIndex
CREATE INDEX "Vote_eventId_voterId_voteType_createdAt_idx" ON "Vote"("eventId", "voterId", "voteType", "createdAt");

-- CreateIndex
CREATE INDEX "Vote_contestantId_idx" ON "Vote"("contestantId");

-- CreateIndex
CREATE INDEX "Vote_eventId_createdAt_idx" ON "Vote"("eventId", "createdAt");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES "Contestant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
