"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newPassword } from "@/actions/new-password";
import { ThemeToggle } from "@/components/ThemeToggle";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(() => {
      newPassword({ password }, token).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);

        if (data?.success) {
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      });
    });
  };

  if (!token) {
    return (
      <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-red-200 dark:border-red-900/50 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Missing Token</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          The password reset token is missing from the URL. Please request a new password reset email.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium">
            Request new link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 transition-colors duration-500">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Enter new password
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
          Your new password must be at least 6 characters long.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            New Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              disabled={isPending}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500/20 focus-visible:border-violet-500/50 transition-all text-sm"
            />
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type="password"
              disabled={isPending}
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500/20 focus-visible:border-violet-500/50 transition-all text-sm"
            />
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending || success !== undefined && success !== ""}
          className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-lg shadow-violet-500/20 transition-all"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Resetting...
            </span>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100 transition-colors duration-500 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[40%] h-[40%] bg-violet-500/5 dark:bg-violet-500/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
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

        <Suspense fallback={
          <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-16 shadow-xl text-center flex items-center justify-center">
             <span className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-600 animate-spin" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}
