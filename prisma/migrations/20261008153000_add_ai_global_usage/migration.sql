-- Global AI request accounting protects the shared provider allowance across
-- every user and every application instance.
CREATE TABLE "AiGlobalUsage" (
    "id" TEXT NOT NULL,
    "usageDate" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "unavailableUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiGlobalUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiGlobalUsage_usageDate_key" ON "AiGlobalUsage"("usageDate");
