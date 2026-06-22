/*
  Warnings:

  - The required column `id` was added to the `VerificationToken` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "PageView" ADD COLUMN     "visitorSessionId" TEXT;

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "ProfileVisit" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "visitorId" TEXT,
    "visitorSessionId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorCountry" TEXT,

    CONSTRAINT "ProfileVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileVisit_portfolioId_idx" ON "ProfileVisit"("portfolioId");

-- CreateIndex
CREATE INDEX "ProfileVisit_visitorId_idx" ON "ProfileVisit"("visitorId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileVisit_portfolioId_visitorSessionId_key" ON "ProfileVisit"("portfolioId", "visitorSessionId");

-- CreateIndex
CREATE INDEX "PageView_visitorSessionId_idx" ON "PageView"("visitorSessionId");

-- AddForeignKey
ALTER TABLE "ProfileVisit" ADD CONSTRAINT "ProfileVisit_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileVisit" ADD CONSTRAINT "ProfileVisit_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
