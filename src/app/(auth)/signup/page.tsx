"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Mail, Lock, Eye, EyeOff, User, Check, X, AlertCircle } from "lucide-react";

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
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Account created</h1>
          <p className="text-sm text-zinc-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100 flex transition-colors">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 border-r border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/30 transition-colors">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors">
              Portfolio<span className="text-zinc-500">.os</span>
            </span>
          </Link>
        </div>
        <div className="space-y-4">
          <div className="flex -space-x-2">
            {["Violet", "Emerald", "Amber"].map((color, i) => (
              <div key={color} className={`w-10 h-10 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center text-xs font-bold text-zinc-950 ${
                i === 0 ? "bg-violet-400" : i === 1 ? "bg-emerald-400" : "bg-amber-400"
              }`}>
                {color[0]}
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Join thousands of developers showcasing their work with Portfolio.os.
          </p>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-700 transition-colors">
          &copy; {new Date().getFullYear()} Portfolio.os
        </div>
      </div>

      {/* Right — Signup form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <Link href="/" className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors">
              Portfolio<span className="text-zinc-500">.os</span>
            </span>
          </Link>

          <div className="text-center">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors">
              Create your account
            </h1>
            <p className="text-sm text-zinc-500 mt-2">
              Start building your portfolio in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
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
                  className="w-full h-10 pl-10 pr-12 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors shadow-sm dark:shadow-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-700 font-mono">
                  p/
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-600 px-1">
                Your public URL: p/{username || "your-name"}
              </p>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-10 pl-10 pr-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors shadow-sm dark:shadow-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  className="w-full h-10 pl-10 pr-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors shadow-sm dark:shadow-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password checklist */}
              <div className="space-y-1 pt-1">
                {passwordChecks.map(({ label, check }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    {password && check(password) ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-zinc-300 dark:border-zinc-700" />
                    )}
                    <span className={`text-[10px] ${password && check(password) ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-600"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 transition-colors">
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
