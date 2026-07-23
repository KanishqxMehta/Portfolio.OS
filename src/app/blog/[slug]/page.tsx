import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://portfolioos.dev";
  const url = `${baseUrl.replace(/\/$/, "")}/blog/${slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

// Custom components for MDX to style the markdown
const mdxComponents = {
  h1: (props: any) => <h1 className="text-3xl md:text-4xl font-bold mt-10 mb-6 text-zinc-900 dark:text-zinc-100" {...props} />,
  h2: (props: any) => <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-zinc-900 dark:text-zinc-100" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-bold mt-8 mb-4 text-zinc-900 dark:text-zinc-100" {...props} />,
  p: (props: any) => <p className="leading-relaxed text-zinc-600 dark:text-zinc-400 mb-6 text-[17px]" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-6 mb-6 text-zinc-600 dark:text-zinc-400 space-y-2 text-[17px]" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-6 mb-6 text-zinc-600 dark:text-zinc-400 space-y-2 text-[17px]" {...props} />,
  li: (props: any) => <li {...props} />,
  a: (props: any) => <a className="text-violet-600 dark:text-violet-400 font-semibold hover:underline" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-violet-500 pl-4 italic text-zinc-700 dark:text-zinc-300 my-6 bg-violet-50 dark:bg-violet-500/10 py-3 pr-4 rounded-r-xl" {...props} />
  ),
  strong: (props: any) => <strong className="font-semibold text-zinc-900 dark:text-zinc-100" {...props} />,
};

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100 transition-colors duration-500">
      {/* Simple Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50 transition-colors">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <nav>
            <Link href="/blog" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              All Articles
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors mb-10 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        <article>
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-8">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              {post.readingTime && (
                <span className="flex items-center gap-1.5 before:content-['•'] before:mr-4 before:text-zinc-300 dark:before:text-zinc-700">
                  <Clock className="w-4 h-4" />
                  {post.readingTime}
                </span>
              )}
            </div>
          </header>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>
        </article>
      </main>
    </div>
  );
}
