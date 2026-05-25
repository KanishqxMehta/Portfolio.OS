"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Layout, Palette, Sparkles, UploadCloud, Cpu, PenTool } from "lucide-react";
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);

  // Handle subtle drag highlighting for the AI intake option
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      console.log("File detected for parsing:", files[0].name);
      // Route parsing execution handler goes here
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-100 tracking-tight">
              Portfolio<span className="text-zinc-500">.os</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/edit"
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-full transition-all border border-zinc-700/50 hover:border-zinc-600"
            >
              Log in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>Resume-to-Portfolio Engine Active</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-zinc-100 mb-6 max-w-5xl mx-auto leading-[1.05]"
        >
          Your raw experience,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
            instantly production ready.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-base sm:text-lg text-zinc-400 mb-16 max-w-2xl mx-auto leading-relaxed"
        >
          Drop your resume to compile a high-performance portfolio via AI, or map your layout components manually. Zero friction, total control.
        </motion.p>

        {/* DEVELOPER IMPLEMENTATION: THE SPLIT-ROUTE CHOICE INTERFACE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left mb-24"
        >
          {/* Option A: AI Ingestion (Drop-zone) - Disabled with Coming Soon indicators */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-2xl border p-8 flex flex-col justify-between group/ai transition-all duration-300 min-h-[260px]",
              "border-zinc-800/80 bg-zinc-900/10 cursor-not-allowed opacity-75"
            )}
          >
            {/* Corner Accent Badge */}
            <div className="absolute top-3 right-3 bg-zinc-800 text-zinc-400 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md border border-zinc-700/60 shadow-sm uppercase">
              Coming Soon
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-500">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-zinc-400 mb-2">Convert via AI Engine</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                Upload your PDF, DOCX, or JSON resume. We'll decompose your entries and structure your layouts natively.
              </p>
            </div>

            {/* Ingestion Trigger Button Area */}
            <div className="w-full py-4 border border-dashed border-zinc-800/80 rounded-xl bg-zinc-950/20 flex flex-col items-center justify-center gap-1">
              <UploadCloud className="w-5 h-5 text-zinc-700" />
              <span className="text-xs font-semibold text-zinc-600">
                AI Parser Offline
              </span>
            </div>
          </div>

          {/* Option B: Manual Builder Path - Fully Active */}
          <Link
            href="/dashboard/edit"
            className="rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 p-8 flex flex-col justify-between group transition-all duration-300 min-h-[260px]"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-violet-400 transition-colors">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  Active Path
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Build Block-by-Block</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Step inside our blank canvas workspace. Compose, arrange, and design your hero, project metrics, and timeline modules by hand.
              </p>
            </div>

            <div className="w-full py-4 rounded-xl bg-zinc-800 group-hover:bg-violet-600 border border-zinc-700 group-hover:border-violet-500 flex items-center justify-center gap-2 transition-all shadow-sm">
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                Open Workspace
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </main>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Layout,
                title: "Block-based Editor",
                description:
                  "Construct your portfolio with intuitive, pre-designed blocks that look perfect out of the box.",
              },
              {
                icon: Palette,
                title: "Premium Aesthetics",
                description:
                  "Typography and spacing curated for a high-end feel. Stand out with minimal effort.",
              },
              {
                icon: Sparkles,
                title: "Instant Publishing",
                description:
                  "One click to publish. Get a beautiful, unique URL to share with recruiters and clients.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950 py-12 text-zinc-400">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Brand Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <span className="text-sm font-medium tracking-tight text-zinc-200">
            Portfolio<span className="text-zinc-500">.os</span>
          </span>
          <span className="text-xs text-zinc-600">© {new Date().getFullYear()}</span>
        </div>

        {/* Right Side: Navigation Columns */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs font-medium">
          <Link href="#features" className="hover:text-zinc-200 transition-colors">
            About
          </Link>
          <a href="mailto:support@portfolio.os" className="hover:text-zinc-200 transition-colors">
            Contact Us
          </a>
          <Link href="/privacy" className="hover:text-zinc-200 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-zinc-200 transition-colors">
            Terms of Service
          </Link>
        </div>
        
      </div>
    </footer>
    </div>
  );
}
