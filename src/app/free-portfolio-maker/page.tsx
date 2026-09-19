import type { Metadata } from "next";
import { ProgrammaticLandingPage } from "@/components/landing/ProgrammaticLandingPage";

export const metadata: Metadata = {
  title: "Free Portfolio Maker for Developers — Build Website in 60s | Portfolio.OS",
  description:
    "Build a modern developer portfolio website 100% free forever. No credit card, no paywalled themes. Import your resume or start with developer-first templates.",
  keywords: [
    "free portfolio maker",
    "free portfolio website builder",
    "free developer portfolio maker",
    "portfolio maker free",
    "free software engineer portfolio",
    "free coding portfolio",
    "create developer portfolio free",
  ],
  alternates: {
    canonical: "https://portfolioos.dev/free-portfolio-maker",
  },
  openGraph: {
    title: "Free Portfolio Maker for Developers | Portfolio.OS",
    description: "Create and publish a stunning developer portfolio in minutes for free.",
    url: "https://portfolioos.dev/free-portfolio-maker",
    type: "website",
  },
};

export default function FreePortfolioMakerPage() {
  return (
    <>
      {/* WebApplication Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Portfolio.OS — Free Portfolio Maker",
            applicationCategory: "DesignApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Free developer portfolio maker. Create, customize, and host your developer portfolio website with zero cost and no hidden paywalls.",
            featureList: [
              "100% Free portfolio hosting",
              "Custom public slug (portfolioos.dev/p/yourname)",
              "Curated developer themes & layouts",
              "1-click PDF resume parser",
              "ATS resume export",
              "Real-time visitor analytics",
            ],
          }),
        }}
      />

      <ProgrammaticLandingPage
        badgeText="100% Free Forever • No Hidden Fees"
        badgeIcon="sparkles"
        h1Title="The Free Portfolio Maker"
        h1Highlight="Built for Developers"
        subheading="Launch a sleek, high-performance developer portfolio in 60 seconds without paying a single dollar. Zero hosting costs, no locked templates, and no credit card required."
        primaryCtaText="Start Building for Free"
        secondaryCtaText="See Free Examples"
        canonicalPath="/free-portfolio-maker"
        featuresTitle="Everything You Need to Stand Out — 100% Free"
        featuresSubtitle="We believe every developer deserves a world-class portfolio to land their dream job without expensive monthly subscription fees."
        features={[
          {
            title: "Free Custom Public URL",
            description: "Get a clean, shareable URL (portfolioos.dev/p/yourname) ready to drop into your resume, GitHub README, and LinkedIn bio.",
            icon: "globe",
          },
          {
            title: "Zero Paywalled Themes",
            description: "Access our entire collection of handcrafted developer themes including Neo-Brutalist, Cyberpunk Terminal, Glassmorphism, and Minimalist.",
            icon: "palette",
          },
          {
            title: "AI Resume Ingestion",
            description: "Upload your PDF resume and our AI parser extracts your work experience, projects, and skills directly into editable blocks.",
            icon: "zap",
          },
          {
            title: "Real-Time Visitor Analytics",
            description: "Track recruiter views, project link clicks, and traffic sources directly from your private analytics dashboard.",
            icon: "cpu",
          },
          {
            title: "ATS-Friendly PDF Export",
            description: "Convert your published web portfolio back into a clean, recruiter-approved ATS resume PDF with one click.",
            icon: "file-text",
          },
          {
            title: "High Performance (100 Lighthouse)",
            description: "Engineered with Next.js App Router for instant page loads, smooth client transitions, and top-tier SEO discoverability.",
            icon: "shield",
          },
        ]}
        stepsTitle="Build and Publish in 3 Quick Steps"
        stepsSubtitle="No complex code setup, no DNS headaches. Just fast, simple block editing."
        steps={[
          {
            step: "Step 1",
            title: "Import or Pick a Template",
            description: "Upload your existing PDF resume for automatic extraction, or start fresh with a curated developer layout.",
          },
          {
            step: "Step 2",
            title: "Customize Blocks & Palette",
            description: "Reorder blocks with drag-and-drop, choose your accent colors, and enhance project descriptions with Gemini AI.",
          },
          {
            step: "Step 3",
            title: "Publish to Your URL",
            description: "Hit publish and instantly receive your live link to share with recruiters and engineering hiring managers.",
          },
        ]}
        comparisonRows={[
          {
            feature: "Monthly Cost",
            portfolioOs: "$0 (Free Forever)",
            others: "$16 - $32 / month",
          },
          {
            feature: "Credit Card Required",
            portfolioOs: "Never",
            others: "Usually required for trial",
          },
          {
            feature: "Developer Tech Stack Badges",
            portfolioOs: true,
            others: false,
          },
          {
            feature: "PDF Resume to Website Ingestion",
            portfolioOs: true,
            others: false,
          },
          {
            feature: "Page Load Speed",
            portfolioOs: "< 300ms (Next.js)",
            others: "Bloated / 2-4s scripts",
          },
        ]}
        faqs={[
          {
            question: "Is Portfolio.OS really 100% free?",
            answer:
              "Yes! You can create, customize, and host your developer portfolio on Portfolio.OS for free. We do not require a credit card, and core portfolio features including custom slugs, themes, and visitor analytics are completely free.",
          },
          {
            question: "Can I use my free portfolio on my resume and LinkedIn?",
            answer:
              "Absolutely! Each portfolio receives a permanent, clean URL like 'portfolioos.dev/p/yourname'. It is fully responsive on mobile and desktop, making it perfect for job applications and networking.",
          },
          {
            question: "Do I need coding skills to use this free portfolio maker?",
            answer:
              "No coding skills are required. You can build your entire portfolio using an intuitive visual block editor with live preview, or simply upload your PDF resume and let our system generate your site automatically.",
          },
          {
            question: "Can I export my portfolio to an ATS resume PDF?",
            answer:
              "Yes! You can download a standardized, ATS-compliant PDF version of your portfolio anytime to submit to job boards.",
          },
        ]}
      />
    </>
  );
}
