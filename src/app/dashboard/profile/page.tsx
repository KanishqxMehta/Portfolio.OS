"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, ArrowLeft, User, Mail, Globe, CheckCircle2, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Navbar */}
      <nav className="h-14 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 px-6 flex items-center z-50 shrink-0 shadow-sm shadow-black/20">
        <Link href="/dashboard/edit" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors mr-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Editor</span>
        </Link>
        <div className="w-px h-5 bg-zinc-800/80 mr-6" />
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 shadow-md shadow-violet-500/20 transition-all">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            Portfolio<span className="text-zinc-500">.os</span>
          </span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-800/80 bg-zinc-900/50">
            <h1 className="text-xl font-semibold text-zinc-100">Account Settings</h1>
            <p className="text-sm text-zinc-400 mt-1">Manage your profile details and preferences.</p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Display Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-violet-500/50"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Username (Public Slug)
                </label>
                <Input
                  value={(session?.user as any)?.username || ""}
                  disabled
                  className="bg-zinc-950 border-zinc-800/50 text-zinc-500 opacity-70 cursor-not-allowed"
                />
                <p className="text-[10px] text-zinc-600">Username cannot be changed currently.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <Input
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-zinc-950 border-zinc-800/50 text-zinc-500 opacity-70 cursor-not-allowed"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/30 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30 text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully.
              </div>
            )}

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white border-0 rounded-xl font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
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
