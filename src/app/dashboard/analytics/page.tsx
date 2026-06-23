import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { AnalyticsChart } from "./ChartWrapper";
import { format, subDays, formatDistanceToNow } from "date-fns";
import { Eye, TrendingUp, Calendar, Globe, UserCheck } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/DashboardHeader";

export default async function AnalyticsPage() {
  // Enforce a minimum load duration of 1 second for a smooth transition
  await new Promise((resolve) => setTimeout(resolve, 1000));

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
        <Link href="/dashboard/edit" className="text-violet-500 hover:underline mt-2">Go to Editor</Link>
      </div>
    );
  }

  const portfolioId = portfolioResult.rows[0].id;
  const publicSlug = portfolioResult.rows[0].publicSlug;

  // Total views
  const totalViewsResult = await pool.query(
    'SELECT COUNT(*) as count FROM "PageView" WHERE "portfolioId" = $1',
    [portfolioId]
  );
  const totalViews = parseInt(totalViewsResult.rows[0].count, 10);

  // Views in the last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);
  
  const recentViewsResult = await pool.query(
    'SELECT "createdAt" FROM "PageView" WHERE "portfolioId" = $1 AND "createdAt" >= $2 ORDER BY "createdAt" ASC',
    [portfolioId, thirtyDaysAgo]
  );

  // Process data for Recharts (group by date)
  const viewsByDate = new Map<string, number>();
  
  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = subDays(new Date(), i);
    viewsByDate.set(format(d, "MMM dd"), 0);
  }

  recentViewsResult.rows.forEach((row) => {
    const d = format(new Date(row.createdAt), "MMM dd");
    if (viewsByDate.has(d)) {
      viewsByDate.set(d, viewsByDate.get(d)! + 1);
    }
  });

  const chartData = Array.from(viewsByDate.entries()).map(([date, views]) => ({
    date,
    views,
  }));

  const viewsLast30Days = recentViewsResult.rows.length;

  // Fetch recent profile visits
  const recentVisitorsResult = await pool.query(
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
     ORDER BY pv."lastSeen" DESC
     LIMIT 10`,
    [portfolioId]
  );
  const recentVisitors = recentVisitorsResult.rows;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100">
      {/* Shared Responsive Header */}
      <DashboardHeader
        currentPage="analytics"
        publicSlug={publicSlug}
        initialUser={session.user ? { name: session.user.name, email: session.user.email } : undefined}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Portfolio Traffic</h1>
          <p className="text-sm text-zinc-500">Track how many visitors are viewing your resume.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-500">Total Views</span>
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalViews}</p>
              <p className="text-xs text-zinc-500 mt-1">Lifetime page views</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-500">Last 30 Days</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{viewsLast30Days}</p>
              <p className="text-xs text-zinc-500 mt-1">Recent engagement</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 border border-violet-500 shadow-xl shadow-violet-500/20 flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col h-full justify-center">
              <h3 className="text-lg font-bold text-white mb-2">Want deeper insights?</h3>
              <p className="text-xs text-violet-200 font-medium mb-4 leading-relaxed">
                Unlock advanced analytics, visitor geography, and device tracking with Pro.
              </p>
              <button disabled className="w-max px-4 py-2 bg-white/20 text-white/95 text-xs font-bold rounded-lg cursor-not-allowed border border-white/15 backdrop-blur-sm">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Views Over Time</h3>
              <p className="text-xs text-zinc-500">Daily breakdown for the last 30 days</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              30 Days
            </div>
          </div>
          
          {totalViews === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4 animate-pulse">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">No traffic recorded yet</h4>
              <p className="text-xs text-zinc-500 max-w-sm leading-relaxed mb-6">
                Your portfolio is live! Share your unique URL with recruiters, clients, or on social profiles to start tracking visits.
              </p>
              <Link
                href={`/p/${publicSlug}`}
                target="_blank"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>View Live Portfolio</span>
              </Link>
            </div>
          ) : (
            <AnalyticsChart data={chartData} />
          )}
        </div>

        {/* Who Viewed Your Portfolio */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Who Viewed Your Portfolio</h3>
              <p className="text-xs text-zinc-500">Track and identify visitors viewing your profile details.</p>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {recentVisitors.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-zinc-500">No visitors recorded yet.</p>
              </div>
            ) : (
              recentVisitors.map((visitor: any) => {
                const isLogged = !!visitor.visitorEmail;
                const displayName = isLogged ? (visitor.visitorName || visitor.visitorUsername) : "Anonymous Visitor";
                const displaySubtitle = isLogged 
                  ? `@${visitor.visitorUsername} • Platform Member`
                  : visitor.visitorCountry 
                    ? `Guest from ${visitor.visitorCountry}`
                    : "Guest Visitor";

                const initials = displayName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2);

                return (
                  <div key={visitor.id} className="py-4 flex items-center justify-between group first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      {isLogged && visitor.visitorImage ? (
                        <img 
                          src={visitor.visitorImage} 
                          alt={displayName} 
                          className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800/60 text-zinc-650 dark:text-zinc-400 font-bold text-xs flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                          {initials}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <span>{displayName}</span>
                          {visitor.visitorCountry && (
                            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 px-1.5 py-0.5 rounded text-zinc-500 uppercase tracking-wider font-mono">
                              {visitor.visitorCountry}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{displaySubtitle}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {visitor.count} {visitor.count === 1 ? "visit" : "visits"}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Last seen {formatDistanceToNow(new Date(visitor.lastSeen), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
