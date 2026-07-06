import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-500">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center">
        <div className="mb-8">
          <Logo size="xl" />
        </div>

        <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 leading-none mb-4">
          404
        </h1>
        <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 font-light max-w-md leading-relaxed mb-10">
          This page doesn&apos;t exist. The portfolio you&apos;re looking for may have been removed or the link might be incorrect.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mt-16 opacity-60">
          <Logo size="sm" />
        </div>
      </div>
    </div>
  );
}
