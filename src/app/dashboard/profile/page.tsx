"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/DashboardHeader";
import { User, Mail, Globe, CheckCircle2, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Auth redirection is handled by middleware.ts, client side only loads when authenticated.

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      await update({ name }); // Update next-auth session data
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const userInitial =
    session?.user?.name?.charAt(0)?.toUpperCase() ||
    session?.user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-500 selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100">
      {/* Shared Responsive Navbar */}
      <DashboardHeader currentPage="profile" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 py-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/80 overflow-hidden transition-all duration-300 relative z-10">
          <div className="px-8 py-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center relative overflow-hidden">
            {/* Corner accent border */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />
            
            {/* Visual Avatar Bubble */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-violet-500/20 mx-auto mb-4 hover:scale-105 transition-transform duration-300">
              {userInitial}
            </div>

            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Account Settings</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Manage your profile details and credentials.</p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="space-y-4">
              {/* Display Name Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 shrink-0" /> Display Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-violet-500/35 focus-visible:border-violet-500/60 h-10 rounded-xl transition-all"
                  placeholder="Your full name"
                />
              </div>

              {/* Username Input (Locked) */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 shrink-0" /> Username (Public Slug)
                </label>
                <div className="relative">
                  <Input
                    value={(session?.user as any)?.username || ""}
                    disabled
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 text-zinc-400 dark:text-zinc-500 opacity-70 cursor-not-allowed h-10 rounded-xl pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded tracking-wide uppercase">
                    Locked
                  </span>
                </div>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500">Username cannot be changed currently.</p>
              </div>

              {/* Email Input (Locked) */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> Email Address
                </label>
                <Input
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 text-zinc-400 dark:text-zinc-500 opacity-70 cursor-not-allowed h-10 rounded-xl"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Profile updated successfully.</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white border-0 rounded-xl font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
