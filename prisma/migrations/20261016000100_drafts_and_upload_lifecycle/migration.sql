CREATE TABLE "PortfolioDraft" (
  "userId" TEXT PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "snapshot" JSONB NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "ProjectUpload" (
  "id" TEXT PRIMARY KEY,
  "ownerId" TEXT NOT NULL,
  "storageBase" TEXT NOT NULL,
  "bucket" TEXT NOT NULL,
  "paths" TEXT[] NOT NULL,
  "urls" TEXT[] NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "unusedSince" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectUpload_status_check" CHECK ("status" IN ('active', 'deleting', 'deleted'))
);
CREATE INDEX "ProjectUpload_status_unusedSince_idx" ON "ProjectUpload"("status", "unusedSince");
CREATE INDEX "ProjectUpload_ownerId_idx" ON "ProjectUpload"("ownerId");
ALTER TABLE "PortfolioDraft" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectUpload" ENABLE ROW LEVEL SECURITY;
