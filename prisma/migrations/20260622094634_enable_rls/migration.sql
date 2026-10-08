-- Enable Row Level Security (RLS) on all tables for Supabase production security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Portfolio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PageView" ENABLE ROW LEVEL SECURITY;

-- The application connects using the role configured in DATABASE_URL. Target the
-- active migration role rather than assuming a cluster-specific `postgres` role.
-- We define permissive RLS policies so the app service itself is not blocked by RLS.
-- This ensures the DB is protected by default while allowing your application logic to control authorization.

CREATE POLICY "Allow all operations for application role on User" ON "User" FOR ALL TO CURRENT_USER USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for application role on Account" ON "Account" FOR ALL TO CURRENT_USER USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for application role on Session" ON "Session" FOR ALL TO CURRENT_USER USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for application role on VerificationToken" ON "VerificationToken" FOR ALL TO CURRENT_USER USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for application role on Portfolio" ON "Portfolio" FOR ALL TO CURRENT_USER USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for application role on PageView" ON "PageView" FOR ALL TO CURRENT_USER USING (true) WITH CHECK (true);
