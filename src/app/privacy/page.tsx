import Link from "next/link";
import { StaticHeader } from "@/components/StaticHeader";
import { Logo } from "@/components/ui/Logo";

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Last updated: June 20, 2026
            </p>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-8">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">1. Overview</h2>
              <p>
                At Portfolio.os, we respect your privacy. This policy describes how we collect, store, and utilize your account details and visitor metrics when you use our block-based portfolio workspace.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">2. Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong className="text-zinc-800 dark:text-zinc-200">Account Credentials:</strong> We store your email address, username, profile name, and password hashes (encrypted via Argon2) during signup.
                </li>
                <li>
                  <strong className="text-zinc-800 dark:text-zinc-200">OAuth Data:</strong> If you sign in via Google or GitHub, we store your profile email, name, and image avatar URL.
                </li>
                <li>
                  <strong className="text-zinc-800 dark:text-zinc-200">Portfolio Data:</strong> Any layouts, timelines, quote text, projects, and contact targets you publish to the editor are stored in our secure database.
                </li>
                <li>
                  <strong className="text-zinc-800 dark:text-zinc-200">Anonymized Analytics:</strong> When a user visits your public portfolio, we log pageview events (timestamp, relative page path, and hashed identifiers) to compile traffic analytics without logging raw IP addresses or personally identifiable information.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">3. Cookies</h2>
              <p>
                We use standard session cookies to keep you signed in to your dashboard. We do not place advertising pixels, beacons, or third-party marketing tracking cookies on your workspace or public portfolio page.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">4. Third-Party Sharing</h2>
              <p>
                We do not sell, rent, or trade your personal details to advertising networks or third-party data brokers. We share data only with hosting providers and database processors required to deliver the core editor service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">5. Contact</h2>
              <p>
                If you have any questions regarding your data storage, account deletion, or analytics metrics, please reach out to us at{" "}
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
              <Link href="/terms" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
