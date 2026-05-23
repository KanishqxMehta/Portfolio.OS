import Link from "next/link";
import { ArrowRight, Layers, Layout, Palette, Sparkles } from "lucide-react";
import * as motion from "framer-motion/client";

export default function Home() {
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
            <Link
              href="/dashboard/edit"
              className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-full transition-all shadow-[0_0_20px_-5px_rgba(124,58,237,0.4)] hover:shadow-[0_0_25px_-5px_rgba(124,58,237,0.5)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>v1.0 is now live</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-zinc-100 mb-8 max-w-4xl mx-auto leading-[1.1]"
        >
          Craft your digital{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
            identity.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-lg sm:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Build a stunning, high-performance portfolio in minutes. Minimal
          effort, maximum impact. Designed for developers and designers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/dashboard/edit"
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-full transition-all flex items-center justify-center gap-2 group shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)]"
          >
            Start Building
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#features"
            className="w-full sm:w-auto px-8 py-4 text-base font-medium text-zinc-300 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 rounded-full transition-all border border-zinc-800 backdrop-blur-sm"
          >
            View Demo
          </Link>
        </motion.div>

        {/* Browser Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="mt-24 relative mx-auto max-w-5xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-violet-900/20">
            <div className="h-12 border-b border-zinc-800/80 flex items-center px-4 gap-2 bg-zinc-900">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="ml-4 px-3 py-1 rounded bg-zinc-800 text-xs text-zinc-500 font-mono">
                portfolio.os / dashboard
              </div>
            </div>
            <div className="p-8 aspect-video bg-zinc-950 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#27272a_25%,transparent_25%,transparent_75%,#27272a_75%,#27272a),linear-gradient(45deg,#27272a_25%,transparent_25%,transparent_75%,#27272a_75%,#27272a)] bg-[size:20px_20px] bg-[position:0_0,10px_10px]" />
              <div className="grid grid-cols-3 gap-6 w-full max-w-3xl z-10">
                <div className="col-span-1 space-y-4">
                  <div className="h-24 rounded-xl bg-zinc-800/80 border border-zinc-700/50" />
                  <div className="h-32 rounded-xl bg-zinc-800/80 border border-zinc-700/50" />
                  <div className="h-20 rounded-xl bg-zinc-800/80 border border-zinc-700/50" />
                </div>
                <div className="col-span-2 rounded-xl bg-zinc-900 border border-zinc-700/50 p-6 space-y-6">
                  <div className="w-1/3 h-8 rounded-lg bg-zinc-800" />
                  <div className="space-y-2">
                    <div className="w-full h-4 rounded bg-zinc-800/50" />
                    <div className="w-5/6 h-4 rounded bg-zinc-800/50" />
                    <div className="w-4/6 h-4 rounded bg-zinc-800/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 rounded-lg bg-zinc-800/50" />
                    <div className="h-32 rounded-lg bg-zinc-800/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
}
