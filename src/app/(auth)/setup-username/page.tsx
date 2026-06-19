"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, User, Check } from "lucide-react";

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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100 flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-8">
        <Link href="/" className="flex items-center gap-2 justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-zinc-100 tracking-tight">
            Portfolio<span className="text-zinc-500">.os</span>
          </span>
        </Link>

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
            Choose your username
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            This will be your public portfolio URL
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(slugify(e.target.value))}
                placeholder="your-name"
                required
                minLength={3}
                maxLength={20}
                className="w-full h-10 pl-10 pr-12 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-700 font-mono">
                p/
              </span>
            </div>
            <p className="text-[10px] text-zinc-600 px-1">
              Your public URL: p/{username || "your-name"}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || username.length < 3}
            className="w-full h-10 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
  );
}
