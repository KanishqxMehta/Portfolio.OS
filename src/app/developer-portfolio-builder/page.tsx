import type { Metadata } from "next";
import { ProgrammaticLandingPage } from "@/components/landing/ProgrammaticLandingPage";

export const metadata: Metadata = {
  title: "Developer Portfolio Builder — Built for Software Engineers | Portfolio.OS",
  description:
    "The portfolio builder engineered specifically for software developers. Showcase GitHub projects, tech stacks, and engineering experience with terminal, bento, and brutalist themes.",
  keywords: [
    "developer portfolio builder",
    "software engineer portfolio",
    "tech portfolio maker",
    "web developer portfolio builder",
    "coding portfolio website",
    "frontend developer portfolio",
    "fullstack developer portfolio",
  ],
  alternates: {
    canonical: "https://portfolioos.dev/developer-portfolio-builder",
  },
  openGraph: {
    title: "Developer Portfolio Builder | Portfolio.OS",
    description: "Built for software engineers, frontend devs, and tech creators. Showcase code, projects, and skills with developer aesthetics.",
    url: "https://portfolioos.dev/developer-portfolio-builder",
    type: "website",
  },
};

export default function DeveloperPortfolioBuilderPage() {
  return (
    <>
      {/* SoftwareApplication Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Portfolio.OS — Developer Portfolio Builder",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Purpose-built portfolio creator for software engineers, web developers, and computer science students. Features tech badges, terminal aesthetic themes, and project live links.",
            featureList: [
              "Developer themes (Terminal, Bento, Neo-Brutalist, Minimal)",
              "Live project demos & GitHub repository links",
              "Interactive tech stack tag explorer",
              "Recruiter visitor analytics",
              "Fast 100 Lighthouse performance score",
            ],
          }),
        }}
      />

      <ProgrammaticLandingPage
        badgeText="Designed Specifically for Software Engineers"
        badgeIcon="terminal"
        h1Title="The Portfolio Builder"
        h1Highlight="Engineered for Developers"
        subheading="Generic website builders are bloated with drag-and-drop fluff and lack developer features. Portfolio.OS is tailored for engineers who want clean code aesthetics, tech stack badges, and blazing performance."
        primaryCtaText="Build Your Dev Portfolio"
        secondaryCtaText="Browse Developer Portfolios"
        canonicalPath="/developer-portfolio-builder"
        featuresTitle="Developer-First Features You Won't Find on Wix or Squarespace"
        featuresSubtitle="Built from the ground up to showcase what recruiters and engineering managers actually care about."
        features={[
          {
            title: "Terminal & Code Themes",
            description: "Choose from authentic developer themes like Cyberpunk Terminal, Monokai Dark, Clean Bento, and Swiss Neo-Brutalist.",
            icon: "terminal",
          },
          {
            title: "GitHub & Live Demo Links",
            description: "Directly showcase your GitHub repositories, star counts, live web applications, and documentation links on every project card.",
            icon: "git-branch",
          },
          {
            title: "Interactive Tech Badges",
            description: "Tag your competencies with structured badges (React, TypeScript, Next.js, Rust, Docker, PostgreSQL) that recruiters can filter.",
            icon: "code",
          },
          {
            title: "100 Lighthouse Performance",
            description: "Static generation, zero bloat, and modern server rendering ensure your portfolio loads instantly on any connection.",
            icon: "cpu",
          },
          {
            title: "Interactive Explorer Directory",
            description: "Opt into the public developer directory (/search) so tech recruiters browsing by skill tag can discover your profile.",
            icon: "globe",
          },
          {
            title: "Visitor Analytics & Click Tracking",
            description: "Know when recruiters view your portfolio and track how many people clicked through to your GitHub projects.",
            icon: "layers",
          },
        ]}
        stepsTitle="From Code to Live Portfolio in 3 Steps"
        stepsSubtitle="Spend less time building website scaffolding and more time shipping code."
        steps={[
          {
            step: "Step 1",
            title: "Add Your Projects & Tech",
            description: "List your top repositories, live demos, and technologies. Or import everything automatically from your resume.",
          },
          {
            step: "Step 2",
            title: "Select a Developer Theme",
            description: "Choose an aesthetic that matches your personal taste: minimal, dark terminal, bento grid, or modern aesthetic.",
          },
          {
            step: "Step 3",
            title: "Share Your Clean Link",
            description: "Put portfolioos.dev/p/yourname in your GitHub profile, LinkedIn about section, and job applications.",
          },
        ]}
        comparisonRows={[
          {
            feature: "Aesthetic Tailored for Tech",
            portfolioOs: "100% Developer-first themes",
            others: "Generic florist / cafe templates",
          },
          {
            feature: "Code & GitHub Integration",
            portfolioOs: "Native repository & demo cards",
            others: "Requires custom embedding",
          },
          {
            feature: "Lighthouse Performance Score",
            portfolioOs: "98 - 100",
            others: "50 - 75 (script heavy)",
          },
          {
            feature: "Public Skill Explorer Indexing",
            portfolioOs: true,
            others: false,
          },
        ]}
        faqs={[
          {
            question: "Why not just code my own portfolio from scratch?",
            answer:
              "Coding your own portfolio from scratch takes weeks of styling, responsive debugging, responsive testing, dark mode toggling, and CMS setup. And then you have to maintain it. Portfolio.OS gives you a polished, high-performance developer portfolio in 2 minutes, freeing your time to build real engineering projects.",
          },
          {
            question: "Can I show multiple tech stacks and roles?",
            answer:
              "Yes! You can organize your skills by category (Frontend, Backend, DevOps, Languages) and add detailed descriptions for each project showcasing the exact stack used.",
          },
          {
            question: "Can recruiters find my portfolio through Google or Portfolio.OS?",
            answer:
              "Yes! All published portfolios are SEO-indexed with schema.org metadata and canonical URLs, and can also be discovered through the Portfolio.OS /search talent explorer directory.",
          },
          {
            question: "How much does hosting cost?",
            answer:
              "Portfolio hosting on Portfolio.OS is completely free. We do not charge hosting fees or server maintenance costs.",
          },
        ]}
      />
    </>
  );
}
