"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full h-11 px-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all";

const labelClass =
  "text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500";

export function ContactForm() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const user = session?.user;
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [session]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setForm({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Message sent!</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          Thanks for reaching out. We&apos;ll review your message and get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className={labelClass}>Name</label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Email</label>
          <input
            type="email"
            required
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={cn(
              fieldClass,
              session?.user && "bg-zinc-100/50 dark:bg-zinc-900/50 cursor-not-allowed opacity-80"
            )}
            readOnly={!!session?.user}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Subject</label>
        <input
          type="text"
          required
          placeholder="How can we help?"
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Message</label>
        <textarea
          required
          rows={5}
          placeholder="Tell us more about what you're looking for..."
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className={`${fieldClass} min-h-[120px] h-auto resize-none py-3 leading-relaxed`}
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full h-11 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === "sending" ? (
          <span className="w-4 h-4 rounded-full border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
