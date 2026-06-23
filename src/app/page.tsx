"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ArrowRight, Layers, Layout, Palette, Sparkles, UploadCloud, Cpu, PenTool, LogOut, LayoutDashboard, Menu, X, ChevronDown, UserCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/ui/Logo";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || "U";

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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100 transition-colors duration-500">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl py-3 shadow-lg dark:shadow-black/40"
            : "border-b border-transparent bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-full transition-all cursor-pointer"
            >
              Features
            </a>
            <Link
              href="/dashboard/edit"
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-full transition-all"
            >
              Editor
            </Link>
            <div className="relative group/pricing px-4 py-2 cursor-pointer rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover/pricing:text-zinc-900 dark:group-hover/pricing:text-zinc-100 transition-colors">
                  Pricing
                </span>
                <span className="text-[9px] font-bold bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/20 uppercase tracking-wider scale-95 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                  Free Beta
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Auth/Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="w-9 h-9 rounded-full bg-zinc-800 animate-pulse" />
            ) : status === "authenticated" ? (
              <div data-user-menu className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800/80 transition-all cursor-pointer ring-2 ring-transparent hover:ring-violet-500/20"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner shadow-violet-400/20">
                    {userInitial}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-500" />
                </button>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-11 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-2xl shadow-black/10 dark:shadow-black/80 overflow-hidden z-50 backdrop-blur-xl"
                  >
                    <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">{session.user?.name || session.user?.email}</p>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">{session.user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <UserCircle className="w-4 h-4" />
                        Edit Profile
                      </Link>
                      <Link
                        href="/dashboard/edit"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer text-left mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white rounded-full transition-all shadow-lg shadow-black/5 dark:shadow-white/5 hover:shadow-black/10 dark:hover:shadow-white/10 hover:scale-105 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
            ) : status === "authenticated" ? (
              <Link
                href="/dashboard/edit"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-violet-500/20"
              >
                {userInitial}
              </Link>
            ) : null}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl p-6 flex flex-col gap-2 shadow-xl shadow-black/5 dark:shadow-2xl dark:shadow-black/80"
          >
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900/50 cursor-pointer"
            >
              Features
            </a>
            <Link
              href="/dashboard/edit"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
            >
              Editor
            </Link>
            <div className="text-base font-medium text-zinc-600 dark:text-zinc-400 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900/50 flex items-center justify-between transition-colors">
              <span>Pricing</span>
              <span className="text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded border border-violet-500/20 uppercase tracking-wider">
                Free Beta
              </span>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-zinc-900 my-2" />

            {status !== "loading" && status !== "authenticated" && (
              <div className="flex flex-col gap-3 mt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 text-center text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-all border border-zinc-200 dark:border-zinc-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 text-center text-sm font-medium text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white rounded-xl transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            )}

            {status === "authenticated" && (
              <div className="flex flex-col gap-1 mt-2">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 text-center text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-all border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2"
                >
                  <UserCircle className="w-4 h-4" />
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full py-3.5 text-center text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 rounded-xl transition-all border border-red-200 dark:border-red-900/30 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-24 text-center">
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
          className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100 mb-6 max-w-5xl mx-auto leading-[1.05] transition-colors duration-500"
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
          className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-16 max-w-2xl mx-auto leading-relaxed transition-colors duration-500"
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
              "border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-900/10 cursor-not-allowed opacity-75 shadow-sm dark:shadow-none"
            )}
          >
            {/* Corner Accent Badge */}
            <div className="absolute top-3 right-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md border border-zinc-300 dark:border-zinc-700/60 shadow-sm uppercase transition-colors">
              Coming Soon
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700/50 flex items-center justify-center text-zinc-500 transition-colors">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-400 mb-2 transition-colors">Convert via AI Engine</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed mb-6 transition-colors">
                Upload your PDF, DOCX, or JSON resume. We'll decompose your entries and structure your layouts natively.
              </p>
            </div>

            {/* Ingestion Trigger Button Area */}
            <div className="w-full py-4 border border-dashed border-zinc-300 dark:border-zinc-800/80 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 flex flex-col items-center justify-center gap-1 transition-colors">
              <UploadCloud className="w-5 h-5 text-zinc-400 dark:text-zinc-700" />
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-600">
                AI Parser Offline
              </span>
            </div>
          </div>

          {/* Option B: Manual Builder Path - Fully Active */}
          <Link
            href="/dashboard/edit"
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-8 flex flex-col justify-between group transition-all duration-300 min-h-[260px] shadow-sm dark:shadow-none"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  Active Path
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 transition-colors">Build Block-by-Block</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed transition-colors">
                Step inside our blank canvas workspace. Compose, arrange, and design your hero, project metrics, and timeline modules by hand.
              </p>
            </div>

            <div className="w-full py-4 rounded-xl bg-zinc-900 dark:bg-zinc-800 group-hover:bg-violet-600 dark:group-hover:bg-violet-600 border border-zinc-800 dark:border-zinc-700 group-hover:border-violet-500 flex items-center justify-center gap-2 transition-all shadow-sm">
              <span className="text-xs font-semibold text-zinc-100 dark:text-zinc-200 group-hover:text-white">
                Open Workspace
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </main>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-transparent transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Layout,
                title: "Flexible Block Editor",
                description:
                  "Decompose and arrange your layout block-by-block with project showcases, experience timelines, social profiles, and fixed contact widgets.",
              },
              {
                icon: Palette,
                title: "Modern Design Themes",
                description:
                  "Choose from six premium custom style templates: Neo-Brutalism, hacker Terminal, Modern Ink splashes, Glassmorphism, and classic presets.",
              },
              {
                icon: Sparkles,
                title: "Traffic Analytics Dashboard",
                description:
                  "Publish instantly to a unique public URL. Monitor real-time page views and visitor engagement stats via your personal dashboard.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 shadow-sm dark:shadow-none transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 py-12 text-zinc-500 dark:text-zinc-400 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Brand Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-colors">
            <Layers className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <span className="text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-200 transition-colors">
            Portfolio<span className="text-zinc-500">.os</span>
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-600 transition-colors">© {new Date().getFullYear()}</span>
        </div>

        {/* Right Side: Navigation Columns */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs font-medium">
          <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            About
          </Link>
          <a href="mailto:codeswagger06@gmail.com" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Contact Us
          </a>
          <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Terms of Service
          </Link>
        </div>
        
      </div>
    </footer>
    </div>
  );
}
