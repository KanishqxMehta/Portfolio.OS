"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SetupUsernamePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const slugify = (val: string) =>
    val.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // For now, just redirect to editor. The portfolio API handles user creation.
      await update({ username });
      router.push("/dashboard/edit");
    } catch {
      setError("Failed to save username");
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center transition-colors">
        <p className="text-zinc-500 dark:text-zinc-400">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100 transition-colors duration-500 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[40%] h-[40%] bg-violet-500/5 dark:bg-violet-500/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[400px] z-10">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 transition-colors duration-500">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors">
              Choose your username
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 transition-colors">
              This will be your public portfolio URL
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(slugify(e.target.value))}
                  placeholder="your-name"
                  required
                  minLength={3}
                  maxLength={20}
                  className="w-full h-11 pl-10 pr-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors shadow-sm dark:shadow-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                  p/
                </span>
              </div>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 px-1">
                Your public URL: p/{username || "your-name"}
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || username.length < 3}
              className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Continue to Dashboard
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
