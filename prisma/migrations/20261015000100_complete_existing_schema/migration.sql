-- These schema features previously existed only on databases synchronized
-- with db push. Preserve those installations while fixing fresh deploys.
ALTER TABLE "Portfolio" ADD COLUMN IF NOT EXISTS "isPublicOnSearch" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "Portfolio_isPublicOnSearch_idx" ON "Portfolio"("isPublicOnSearch");

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");
