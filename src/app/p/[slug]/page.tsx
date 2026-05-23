import { prisma } from "@/lib/prisma";
import { PortfolioRenderer } from "@/components/portfolio/Renderer";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { slug } = await params;

  const portfolio = await prisma.portfolio.findUnique({
    where: { 
      publicSlug: slug
    },
  });

  if (!portfolio) {
    notFound();
  }

  const content = (portfolio.content as any) || {};
  const sections = content.sections || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      <main className="flex-1 w-full">
        <PortfolioRenderer sections={sections} />
      </main>
      
      <footer className="py-20 text-center border-t border-zinc-900">
        <p className="text-sm text-zinc-500 font-medium">
          © {new Date().getFullYear()} • Created with Portfolio.OS
        </p>
      </footer>
    </div>
  );
}