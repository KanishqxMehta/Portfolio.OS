CREATE TABLE "PortfolioAction" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "projectId" TEXT,
    "target" TEXT,
    "visitorHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortfolioAction_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PortfolioAction_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "PortfolioAction_portfolioId_createdAt_idx" ON "PortfolioAction"("portfolioId", "createdAt");
ALTER TABLE "PortfolioAction" ENABLE ROW LEVEL SECURITY;
