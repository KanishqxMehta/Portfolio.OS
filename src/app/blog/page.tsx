import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read the latest articles on developer portfolios, career growth, and web development.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100 transition-colors duration-500">
      {/* Simple Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50 transition-colors">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <nav>
            <Link href="/" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Back to Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
            The Portfolio.OS Blog
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Insights, guides, and tips on building developer portfolios that actually get you hired.
          </p>
        </div>

        <div className="grid gap-8">
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} className="group block">
              <article className="p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                    {post.readingTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readingTime}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {post.description}
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-sm font-semibold text-violet-600 dark:text-violet-400">
                    Read Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-20 text-zinc-500">
              No blog posts found. Add some MDX files to the src/content/blog directory!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
