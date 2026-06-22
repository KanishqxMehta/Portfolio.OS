-- Enable Row Level Security (RLS) on all tables for Supabase production security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Portfolio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PageView" ENABLE ROW LEVEL SECURITY;

-- Since the Next.js app connects via a direct pooler/admin connection using the postgres credentials,
-- we define permissive RLS policies so the app service itself is not blocked by RLS.
-- This ensures the DB is protected by default while allowing your application logic to control authorization.

CREATE POLICY "Allow all operations for application postgres role on User" ON "User" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for application postgres role on Account" ON "Account" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for application postgres role on Session" ON "Session" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for application postgres role on VerificationToken" ON "VerificationToken" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for application postgres role on Portfolio" ON "Portfolio" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for application postgres role on PageView" ON "PageView" FOR ALL TO postgres USING (true) WITH CHECK (true);