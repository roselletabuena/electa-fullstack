-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "dailyFreeVoteLimit" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "isFreeVotingEnabled" BOOLEAN NOT NULL DEFAULT true;
