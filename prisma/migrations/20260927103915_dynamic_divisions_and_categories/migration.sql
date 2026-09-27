-- AlterTable
ALTER TABLE "AwardCategory" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Contestant" ADD COLUMN     "divisionId" TEXT;

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Division_eventId_idx" ON "Division"("eventId");

-- CreateIndex
CREATE INDEX "Division_eventId_displayOrder_idx" ON "Division"("eventId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Division_eventId_name_key" ON "Division"("eventId", "name");

-- CreateIndex
CREATE INDEX "AwardCategory_eventId_displayOrder_idx" ON "AwardCategory"("eventId", "displayOrder");

-- CreateIndex
CREATE INDEX "Contestant_eventId_divisionId_idx" ON "Contestant"("eventId", "divisionId");

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contestant" ADD CONSTRAINT "Contestant_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;
