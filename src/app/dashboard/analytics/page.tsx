import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import Link from "next/link";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AnalyticsDashboardClient } from "./AnalyticsDashboardClient";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user portfolio
  const portfolioResult = await pool.query(
    'SELECT id, "publicSlug" FROM "Portfolio" WHERE "userId" = $1 LIMIT 1',
    [session.user.id]
  );

  if (portfolioResult.rows.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <p className="text-zinc-500">You need to create a portfolio first.</p>
        <Link href="/dashboard/edit" className="text-violet-500 hover:underline mt-2">
          Go to Editor
        </Link>
      </div>
    );
  }

  const portfolioId = portfolioResult.rows[0].id;
  const publicSlug = portfolioResult.rows[0].publicSlug;

  // Total lifetime views
  const totalViewsResult = await pool.query(
    'SELECT COUNT(*) as count FROM "PageView" WHERE "portfolioId" = $1',
    [portfolioId]
  );
  const totalViews = parseInt(totalViewsResult.rows[0].count, 10);

  // Fetch ALL raw PageViews to pass to Client Component for filtering
  const allViewsResult = await pool.query(
    'SELECT "createdAt" FROM "PageView" WHERE "portfolioId" = $1 ORDER BY "createdAt" ASC',
    [portfolioId]
  );

  // Fetch ALL raw ProfileVisits to pass to Client Component for filtering
  const allVisitorsResult = await pool.query(
    `SELECT 
      pv.id,
      pv.count,
      pv."lastSeen",
      pv."visitorCountry",
      u.name as "visitorName",
      u.email as "visitorEmail",
      u.image as "visitorImage",
      u.username as "visitorUsername"
     FROM "ProfileVisit" pv
     LEFT JOIN "User" u ON pv."visitorId" = u.id
     WHERE pv."portfolioId" = $1
     ORDER BY pv."lastSeen" DESC`,
    [portfolioId]
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100">
      <DashboardHeader
        currentPage="analytics"
        publicSlug={publicSlug}
        initialUser={session.user ? { name: session.user.name, email: session.user.email } : undefined}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Portfolio Traffic</h1>
            <p className="text-sm text-zinc-500">Track how many visitors are viewing your resume.</p>
          </div>
        </div>

        <AnalyticsDashboardClient
          publicSlug={publicSlug}
          totalViews={totalViews}
          rawPageViews={allViewsResult.rows}
          rawVisitors={allVisitorsResult.rows}
        />
      </main>
    </div>
  );
}
