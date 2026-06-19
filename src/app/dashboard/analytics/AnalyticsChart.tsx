"use client";

import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AnalyticsChart({ data }: { data: any[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const strokeColor = isDark ? "#8b5cf6" : "#6d28d9"; // violet-500 / violet-700
  const fillColor = isDark ? "#8b5cf6" : "#8b5cf6"; // violet-500
  const textColor = isDark ? "#a1a1aa" : "#71717a"; // zinc-400 / zinc-500
  const gridColor = isDark ? "#27272a" : "#e4e4e7"; // zinc-800 / zinc-200

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#18181b" : "#ffffff", // zinc-900 / white
              borderColor: isDark ? "#27272a" : "#e4e4e7", // zinc-800 / zinc-200
              borderRadius: "12px",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              color: isDark ? "#f4f4f5" : "#18181b", // zinc-50 / zinc-900
            }}
            itemStyle={{ color: strokeColor, fontWeight: 600 }}
            cursor={{ stroke: gridColor, strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke={strokeColor}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorViews)"
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
