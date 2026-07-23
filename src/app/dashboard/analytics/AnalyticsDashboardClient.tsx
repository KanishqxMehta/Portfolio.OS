"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, subDays, subHours, subMonths, isAfter } from "date-fns";
import { Eye, TrendingUp, Calendar, Globe, UserCheck } from "lucide-react";
import { AnalyticsChart } from "./ChartWrapper";
import { DateRangePicker, DateRangeOption } from "./DateRangePicker";

interface PageView {
  createdAt: Date;
}

interface Visitor {
  id: string;
  count: number;
  lastSeen: Date;
  visitorCountry: string | null;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorImage: string | null;
  visitorUsername: string | null;
}

interface AnalyticsDashboardClientProps {
  publicSlug: string;
  totalViews: number;
  rawPageViews: PageView[];
  rawVisitors: Visitor[];
}

export function AnalyticsDashboardClient({
  publicSlug,
  totalViews,
  rawPageViews,
  rawVisitors,
}: AnalyticsDashboardClientProps) {
  const [range, setRange] = useState<DateRangeOption>("1m");

  // Compute filtered data based on range
  const { chartData, viewsInSelectedRange, filteredVisitors, rangeLabel } = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let label = "Last 1 Month";
    const viewsByDate = new Map<string, number>();

    if (range === "24h") {
      startDate = subHours(now, 24);
      label = "Last 24 Hours";
      for (let i = 23; i >= 0; i--) {
        const d = subHours(now, i);
        viewsByDate.set(format(d, "HH:00"), 0);
      }
    } else if (range === "7d") {
      startDate = subDays(now, 7);
      label = "Last 7 Days";
      for (let i = 6; i >= 0; i--) {
        const d = subDays(now, i);
        viewsByDate.set(format(d, "MMM dd"), 0);
      }
    } else if (range === "6m") {
      startDate = subMonths(now, 6);
      label = "Last 6 Months";
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i);
        viewsByDate.set(format(d, "MMM yyyy"), 0);
      }
    } else if (range === "all") {
      startDate = null;
      label = "All Time";
    } else {
      // 1m
      startDate = subDays(now, 30);
      label = "Last 1 Month";
      for (let i = 29; i >= 0; i--) {
        const d = subDays(now, i);
        viewsByDate.set(format(d, "MMM dd"), 0);
      }
    }

    let currentViews = 0;

    // Filter page views
    rawPageViews.forEach((pv) => {
      const pvDate = new Date(pv.createdAt);
      if (startDate && !isAfter(pvDate, startDate)) return;

      currentViews++;

      let key = "";
      if (range === "24h") {
        key = format(pvDate, "HH:00");
      } else if (range === "6m" || range === "all") {
        key = format(pvDate, "MMM yyyy");
      } else {
        key = format(pvDate, "MMM dd");
      }

      // If 'all', we might need to initialize the month key if it doesn't exist
      if (range === "all" && !viewsByDate.has(key)) {
        viewsByDate.set(key, 0);
      }

      if (viewsByDate.has(key)) {
        viewsByDate.set(key, viewsByDate.get(key)! + 1);
      }
    });

    const cData = Array.from(viewsByDate.entries())
      .map(([date, views]) => ({ date, views }))
      // For 'all', sort chronologically as Map might insert out of order depending on first sight
      .sort((a, b) => {
        if (range === "all") {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return 0;
      });

    // Filter visitors
    let filteredV = rawVisitors;
    if (startDate) {
      filteredV = rawVisitors.filter((v) => isAfter(new Date(v.lastSeen), startDate));
    }
    
    // Take top 10 recent
    filteredV = filteredV.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()).slice(0, 10);

    return {
      chartData: cData,
      viewsInSelectedRange: currentViews,
      filteredVisitors: filteredV,
      rangeLabel: label,
    };
  }, [range, rawPageViews, rawVisitors]);

  return (
    <div className="space-y-8">
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
            <span className="text-sm font-medium text-zinc-500">{rangeLabel}</span>
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{viewsInSelectedRange}</p>
            <p className="text-xs text-zinc-500 mt-1">Recent period engagement</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 border border-violet-500 shadow-xl shadow-violet-500/20 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 flex flex-col h-full justify-center">
            <h3 className="text-lg font-bold text-white mb-2">Want deeper insights?</h3>
            <p className="text-xs text-violet-200 font-medium mb-4 leading-relaxed">
              Unlock advanced analytics, visitor geography, and device tracking with Pro.
            </p>
            <button
              disabled
              className="w-max px-4 py-2 bg-white/20 text-white/95 text-xs font-bold rounded-lg cursor-not-allowed border border-white/15 backdrop-blur-sm"
            >
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
            <p className="text-xs text-zinc-500">Breakdown for {rangeLabel}</p>
          </div>
          <DateRangePicker currentRange={range} onChange={setRange} />
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
          {filteredVisitors.length === 0 ? (
            <p className="py-6 text-xs text-zinc-500 text-center">No visitor profiles recorded yet.</p>
          ) : (
            filteredVisitors.map((visitor) => (
              <div key={visitor.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {visitor.visitorImage ? (
                    <Image
                      src={visitor.visitorImage}
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      {(visitor.visitorName || visitor.visitorUsername || "A")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {visitor.visitorName || visitor.visitorUsername || "Anonymous Visitor"}
                      </p>
                      {visitor.visitorCountry && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                          {visitor.visitorCountry}
                        </span>
                      )}
                    </div>
                    {visitor.visitorEmail && (
                      <p className="text-xs text-zinc-500">{visitor.visitorEmail}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-zinc-500">
                    {visitor.count} {visitor.count === 1 ? "visit" : "visits"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
