import { Loader } from "@/components/ui/Loader";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors flex flex-col font-sans">
      <DashboardHeader currentPage="analytics" />
      <div className="flex-1 flex items-center justify-center relative">
        <Loader text="Loading analytics..." />
      </div>
    </div>
  );
}
