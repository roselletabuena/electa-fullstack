-- CreateEnum
CREATE TYPE "EventArchetype" AS ENUM ('PAGEANT', 'STUDENT_COUNCIL', 'HACKATHON', 'CUSTOM');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "archetype" "EventArchetype" NOT NULL DEFAULT 'PAGEANT';

-- AlterTable
ALTER TABLE "Contestant" ADD COLUMN "positionId" TEXT;

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN "positionId" TEXT;

-- CreateTable
CREATE TABLE "EventPosition" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxSelectionsPerVoter" INTEGER NOT NULL DEFAULT 1,
    "minSelectionsPerVoter" INTEGER NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isVotingOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventPosition_eventId_name_key" ON "EventPosition"("eventId", "name");

-- CreateIndex
CREATE INDEX "EventPosition_eventId_idx" ON "EventPosition"("eventId");

-- CreateIndex
CREATE INDEX "EventPosition_eventId_displayOrder_idx" ON "EventPosition"("eventId", "displayOrder");

-- CreateIndex
CREATE INDEX "Contestant_eventId_positionId_idx" ON "Contestant"("eventId", "positionId");

-- CreateIndex
CREATE INDEX "Vote_positionId_idx" ON "Vote"("positionId");

-- AddForeignKey
ALTER TABLE "EventPosition" ADD CONSTRAINT "EventPosition_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contestant" ADD CONSTRAINT "Contestant_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "EventPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "EventPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
