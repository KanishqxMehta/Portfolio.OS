'use client';

import { useEffect } from 'react';
import { Layers, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public page rendering error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
        <Layers className="w-8 h-8 text-rose-500/80 animate-pulse" />
      </div>
      <h1 className="text-xl font-bold text-zinc-100 mb-2">Temporary Connection Issue</h1>
      <p className="text-sm text-zinc-500 max-w-md leading-relaxed mb-6">
        We encountered an error loading this portfolio page from the database. Please try reloading the page.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-violet-500/20 active:scale-95 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Try Again
      </button>
    </div>
  );
}
