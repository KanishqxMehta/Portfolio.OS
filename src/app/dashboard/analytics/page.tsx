import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { AnalyticsChart } from "./ChartWrapper";
import { format, subDays } from "date-fns";
import { Eye, TrendingUp, Calendar, Globe, Layers } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  // Calculate percentage change or just show basic stats
  // We'll keep it simple for now

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100">
      {/* Topbar */}
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-900/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-500">
        <div className="flex items-center gap-6">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 shadow-md shadow-violet-500/20 transition-all">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors hidden sm:block">
              Portfolio<span className="text-zinc-500 dark:text-zinc-400">.os</span>
            </span>
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800/80 hidden sm:block" />

          {/* Navigation Switch */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900/50 p-0.5 sm:p-1 rounded-lg">
            <Link
              href="/dashboard/edit"
              className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              Editor
            </Link>
            <div className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700/50">
              Analytics
            </div>
          </div>
        </div>

        {/* Group Actions on the Right */}
        <div className="flex items-center gap-4">
          <Link
            href={`/p/${publicSlug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 px-2 sm:px-3 py-1.5 rounded-lg transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

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
          
          <AnalyticsChart data={chartData} />
        </div>
      </main>
    </div>
  );
}
