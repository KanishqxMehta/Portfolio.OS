"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Check, X, AlertCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordChecks = [
    { label: "At least 8 characters", check: (p: string) => p.length >= 8 },
    { label: "Contains a number", check: (p: string) => /\d/.test(p) },
    { label: "Contains a letter", check: (p: string) => /[a-zA-Z]/.test(p) },
  ];

  const slugify = (val: string) =>
    val.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100 transition-colors duration-500 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[40%] h-[40%] bg-violet-500/5 dark:bg-violet-500/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        <div className="w-full max-w-[400px] z-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-emerald-450 dark:text-emerald-400 animate-in zoom-in duration-300" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Account created</h1>
          <p className="text-sm text-zinc-550 dark:text-zinc-400">Redirecting to login...</p>
        </div>
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
              Create your account
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Start building your portfolio in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
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
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 px-1">
                Your public URL: p/{username || "your-name"}
              </p>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors shadow-sm dark:shadow-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors shadow-sm dark:shadow-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password checklist */}
              <div className="space-y-1 pt-1">
                {passwordChecks.map(({ label, check }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    {password && check(password) ? (
                      <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-450" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-zinc-200 dark:border-zinc-800" />
                    )}
                    <span className={`text-[10px] ${password && check(password) ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-450 dark:text-zinc-650"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-violet-500/20"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-650 dark:text-zinc-400 transition-colors mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
