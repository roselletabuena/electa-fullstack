-- CreateTable
CREATE TABLE "RubricCriterion" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weight" DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubricCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgeEvaluation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "compositeScore" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JudgeEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgeScore" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "score" DECIMAL(4,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JudgeScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RubricCriterion_eventId_idx" ON "RubricCriterion"("eventId");

-- CreateIndex
CREATE INDEX "RubricCriterion_eventId_displayOrder_idx" ON "RubricCriterion"("eventId", "displayOrder");

-- CreateIndex
CREATE INDEX "JudgeEvaluation_eventId_idx" ON "JudgeEvaluation"("eventId");

-- CreateIndex
CREATE INDEX "JudgeEvaluation_judgeId_idx" ON "JudgeEvaluation"("judgeId");

-- CreateIndex
CREATE INDEX "JudgeEvaluation_submissionId_idx" ON "JudgeEvaluation"("submissionId");

-- CreateIndex
CREATE INDEX "JudgeEvaluation_eventId_isDraft_idx" ON "JudgeEvaluation"("eventId", "isDraft");

-- CreateIndex
CREATE UNIQUE INDEX "JudgeEvaluation_eventId_judgeId_submissionId_key" ON "JudgeEvaluation"("eventId", "judgeId", "submissionId");

-- CreateIndex
CREATE INDEX "JudgeScore_evaluationId_idx" ON "JudgeScore"("evaluationId");

-- CreateIndex
CREATE INDEX "JudgeScore_criterionId_idx" ON "JudgeScore"("criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "JudgeScore_evaluationId_criterionId_key" ON "JudgeScore"("evaluationId", "criterionId");

-- AddForeignKey
ALTER TABLE "RubricCriterion" ADD CONSTRAINT "RubricCriterion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeEvaluation" ADD CONSTRAINT "JudgeEvaluation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeScore" ADD CONSTRAINT "JudgeScore_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "JudgeEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeScore" ADD CONSTRAINT "JudgeScore_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "RubricCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
