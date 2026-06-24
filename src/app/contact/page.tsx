import { StaticHeader } from "@/components/StaticHeader";
import { ContactForm } from "./ContactForm";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { Mail, MessageSquare, Clock, ChevronRight } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-500 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <StaticHeader />

        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 md:py-24 space-y-16">
          {/* Hero section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-semibold uppercase tracking-wider">
              Get in Touch
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
              Let&apos;s talk about your next project.
            </h1>
            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Have a question about Portfolio.os, want to report a bug, or interested in partnering with us? Fill out the form below and we&apos;ll get back to you within 24 hours.
            </p>
          </div>

          {/* Contact form + info grid */}
          <div className="grid md:grid-cols-5 gap-10 pt-4">
            {/* Form — takes 3/5 */}
            <div className="md:col-span-3">
              <ContactForm />
            </div>

            {/* Info — takes 2/5 */}
            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Email us directly</h3>
                    <a
                      href={`mailto:${process.env.CONTACT_EMAIL}`}
                      className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors"
                    >
                      {process.env.CONTACT_EMAIL}
                    </a>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">We reply within 24 hours</p>
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800" />

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Join our community</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Get help, share your portfolio, and connect with other developers building with Portfolio.os.
                    </p>
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800" />

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Response time</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      We aim to respond to all inquiries within 24 hours on business days.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/about"
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-all group"
              >
                Learn more about Portfolio.os
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950 py-12 text-zinc-500 dark:text-zinc-500 transition-colors duration-500 mt-auto">
          <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-6 font-medium text-zinc-400 dark:text-zinc-500">
              <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Home</Link>
              <Link href="/about" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">About</Link>
              <Link href="/contact" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
