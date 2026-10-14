-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ProjectSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable ProjectSubmission
CREATE TABLE IF NOT EXISTS "ProjectSubmission" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teamLeadId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "repositoryUrl" TEXT NOT NULL,
    "demoUrl" TEXT,
    "videoUrl" TEXT,
    "status" "ProjectSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProjectMember
CREATE TABLE IF NOT EXISTS "ProjectMember" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT DEFAULT 'Contributor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProjectTrackTag
CREATE TABLE IF NOT EXISTS "ProjectTrackTag" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTrackTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProjectSubmissionLink
CREATE TABLE IF NOT EXISTS "ProjectSubmissionLink" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectSubmissionLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProjectVote
CREATE TABLE IF NOT EXISTS "ProjectVote" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProjectSubmission_eventId_idx" ON "ProjectSubmission"("eventId");
CREATE INDEX IF NOT EXISTS "ProjectSubmission_teamLeadId_idx" ON "ProjectSubmission"("teamLeadId");
CREATE INDEX IF NOT EXISTS "ProjectSubmission_eventId_status_idx" ON "ProjectSubmission"("eventId", "status");
CREATE INDEX IF NOT EXISTS "ProjectSubmission_createdAt_idx" ON "ProjectSubmission"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectSubmission_eventId_teamLeadId_title_key" ON "ProjectSubmission"("eventId", "teamLeadId", "title");

-- CreateIndex ProjectMember
CREATE INDEX IF NOT EXISTS "ProjectMember_submissionId_idx" ON "ProjectMember"("submissionId");

-- CreateIndex ProjectTrackTag
CREATE INDEX IF NOT EXISTS "ProjectTrackTag_submissionId_idx" ON "ProjectTrackTag"("submissionId");
CREATE INDEX IF NOT EXISTS "ProjectTrackTag_trackName_idx" ON "ProjectTrackTag"("trackName");
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectTrackTag_submissionId_trackName_key" ON "ProjectTrackTag"("submissionId", "trackName");

-- CreateIndex ProjectSubmissionLink
CREATE INDEX IF NOT EXISTS "ProjectSubmissionLink_submissionId_idx" ON "ProjectSubmissionLink"("submissionId");

-- CreateIndex ProjectVote
CREATE INDEX IF NOT EXISTS "ProjectVote_eventId_idx" ON "ProjectVote"("eventId");
CREATE INDEX IF NOT EXISTS "ProjectVote_submissionId_idx" ON "ProjectVote"("submissionId");
CREATE INDEX IF NOT EXISTS "ProjectVote_voterId_idx" ON "ProjectVote"("voterId");
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectVote_eventId_voterId_key" ON "ProjectVote"("eventId", "voterId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "ProjectSubmission" ADD CONSTRAINT "ProjectSubmission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ProjectSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ProjectTrackTag" ADD CONSTRAINT "ProjectTrackTag_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ProjectSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ProjectSubmissionLink" ADD CONSTRAINT "ProjectSubmissionLink_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ProjectSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ProjectVote" ADD CONSTRAINT "ProjectVote_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ProjectVote" ADD CONSTRAINT "ProjectVote_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ProjectSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
