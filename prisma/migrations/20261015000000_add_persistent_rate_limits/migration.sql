CREATE TABLE "RateLimitBucket" (
    "key" TEXT PRIMARY KEY,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMPTZ NOT NULL
);
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");
