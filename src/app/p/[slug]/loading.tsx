import { Layers } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-8 text-center font-sans transition-colors duration-500">
      <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-950/5 dark:via-white/5 to-transparent animate-pulse" />
        <Layers className="w-8 h-8 text-zinc-400 dark:text-zinc-600 animate-pulse" />
      </div>
      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 animate-pulse uppercase tracking-wider">Loading portfolio...</p>
    </div>
  );
}
