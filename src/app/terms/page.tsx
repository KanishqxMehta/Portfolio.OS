import type { Metadata } from "next";
import Link from "next/link";
import { StaticHeader } from "@/components/StaticHeader";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Terms of Service — Portfolio.OS",
  description: "Read the Portfolio.OS terms of service. Understand the terms governing your use of our free portfolio builder platform.",
  alternates: {
    canonical: "/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
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

        {/* Main content container */}
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 md:py-24 space-y-12">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Terms of Service
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Last updated: June 20, 2026
            </p>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-8">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">1. Acceptance of Terms</h2>
              <p>
                By registering an account or publishing a profile on Portfolio.os, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you may not access our workspace or services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">2. Account Registration & Security</h2>
              <p>
                You must provide accurate credentials (email and public slug username) upon signup. You are solely responsible for maintaining the confidentiality of your credentials and account session. One public username slug is linked to each authenticated developer workspace.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">3. User Content & Conduct</h2>
              <p>
                You retain all intellectual property rights to the text, layout structures, and external link endpoints you publish on your public portfolio page. 
              </p>
              <p>
                You agree not to publish any content that is defamatory, illegal, abusive, or designed to inject malicious scripts or phishing forms. We reserve the right to remove any block layouts or delete accounts violating these safety principles.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">4. Beta Service Disclaimer</h2>
              <p>
                Portfolio.os is currently running in Free Beta. The service is provided on an "as-is" and "as-available" basis without warranties of any kind. We reserve the right to modify, pause, or update features, database schemas, or database records at any time to preserve builder stability.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">5. Limitation of Liability</h2>
              <p>
                In no event shall Portfolio.os, its authors, or hosting partners be liable for any indirect, incidental, or consequential damages resulting from database downtime, loss of portfolio configurations, or visitors' traffic metrics.
              </p>
              <p>
                If you have questions about our terms, contact us at{" "}
                <a href={`mailto:${process.env.CONTACT_EMAIL}`} className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">
                  {process.env.CONTACT_EMAIL}
                </a>.
              </p>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950 py-12 text-zinc-500 dark:text-zinc-500 transition-colors duration-500">
          <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-6 font-medium text-zinc-400 dark:text-zinc-500">
              <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Home</Link>
              <Link href="/about" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">About</Link>
              <Link href="/contact" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Privacy</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
