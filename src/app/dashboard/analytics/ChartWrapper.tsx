"use client";

import dynamic from "next/dynamic";

export const AnalyticsChart = dynamic(
  () => import("./AnalyticsChart").then((mod) => mod.AnalyticsChart),
  { ssr: false }
);
