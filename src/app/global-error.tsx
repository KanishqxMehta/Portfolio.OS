"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/error-logger";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to monitoring service
    captureException(error, {
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-violet-500/30">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[500px] h-[500px] bg-violet-600/10 blur-[140px] rounded-full" />
        </div>

        <div className="w-full max-w-[440px] z-10 text-center space-y-6 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Something went wrong
            </h1>
            <p className="text-sm text-zinc-400">
              An unexpected error occurred. Our system has automatically recorded this issue.
            </p>
          </div>

          {error.digest && (
            <p className="text-[11px] font-mono text-zinc-500 bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3 py-1.5 break-all">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>

            <Link
              href="/"
              className="w-full h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-zinc-700/60"
            >
              <Home className="w-4 h-4" />
              Return home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
