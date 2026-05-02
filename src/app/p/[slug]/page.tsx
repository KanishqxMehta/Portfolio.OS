import { prisma } from "@/lib/prisma";
import { PortfolioRenderer } from "@/components/portfolio/Renderer";
import { notFound } from "next/navigation";

// Define the type for the props correctly for Next.js 15
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  // 1. Await the params to get the slug
  const { slug } = await params;

  // 2. Fetch the portfolio from DB
  const portfolio = await prisma.portfolio.findUnique({
    where: { 
      publicSlug: slug // Now slug is a string, not undefined
    },
  });

  // 3. Handle 404
  if (!portfolio) {
    notFound();
  }

  // 4. Parse the content
  const content = (portfolio.content as any) || {};
  const sections = content.sections || [];

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto">
        <PortfolioRenderer sections={sections} />
      </main>
      
      <footer className="py-20 text-center border-t border-slate-50 mt-20">
        <p className="text-sm text-slate-400 font-medium">
          © {new Date().getFullYear()} • Created with Portfolio.OS
        </p>
      </footer>
    </div>
  );
}