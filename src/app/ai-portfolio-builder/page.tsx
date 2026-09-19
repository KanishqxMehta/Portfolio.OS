import type { Metadata } from "next";
import { ProgrammaticLandingPage } from "@/components/landing/ProgrammaticLandingPage";

export const metadata: Metadata = {
  title: "AI Portfolio Maker & Builder for Developers | Portfolio.OS",
  description:
    "Generate a professional developer portfolio website in seconds with AI. Intelligent resume extraction, AI bullet point enhancer, and auto-generated tech layouts.",
  keywords: [
    "ai portfolio maker",
    "ai portfolio builder",
    "ai website builder for developers",
    "ai developer portfolio",
    "ai portfolio generator",
    "generate portfolio with ai",
    "ai resume to portfolio",
  ],
  alternates: {
    canonical: "https://portfolioos.dev/ai-portfolio-builder",
  },
  openGraph: {
    title: "AI Portfolio Maker for Developers | Portfolio.OS",
    description: "Turn your skills and experience into a production-ready developer website in seconds with AI.",
    url: "https://portfolioos.dev/ai-portfolio-builder",
    type: "website",
  },
};

export default function AiPortfolioBuilderPage() {
  return (
    <>
      {/* SoftwareApplication Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Portfolio.OS — AI Developer Portfolio Maker",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "AI-powered portfolio generator for software engineers and web developers. Uses Google Gemini AI to analyze raw experience and generate beautiful web portfolios.",
            featureList: [
              "Gemini AI resume parsing",
              "AI bullet point & impact enhancer",
              "Automated tech stack categorization",
              "Interactive split-screen diff review",
              "One-click theme switching",
            ],
          }),
        }}
      />

      <ProgrammaticLandingPage
        badgeText="Powered by Google Gemini AI"
        badgeIcon="sparkles"
        h1Title="The AI Portfolio Maker"
        h1Highlight="for Modern Developers"
        subheading="Stop struggling with CSS or writing bio paragraphs from scratch. Our AI transforms your raw resume, GitHub projects, and experience into an interactive developer portfolio website in under a minute."
        primaryCtaText="Generate with AI Free"
        primaryCtaHref="/dashboard/edit?action=ai-parser"
        secondaryCtaText="Explore AI Portfolios"
        canonicalPath="/ai-portfolio-builder"
        featuresTitle="AI Engineered for Software Engineers"
        featuresSubtitle="Purpose-built AI models that understand frameworks, repositories, metrics, and engineering achievements."
        features={[
          {
            title: "Smart Resume Extraction",
            description: "Upload any PDF resume. Our multimodal AI parser parses your experience, degrees, certifications, and links into structured portfolio blocks.",
            icon: "brain",
          },
          {
            title: "AI Text & Impact Enhancer",
            description: "Turn weak bullet points into high-impact, quantified metrics formatted to catch the attention of top engineering recruiters.",
            icon: "wand",
          },
          {
            title: "Staged Diff Review System",
            description: "Review every AI suggestion side-by-side against your existing content. Selectively accept or reject changes with full version control.",
            icon: "layers",
          },
          {
            title: "Tech Stack Auto-Detection",
            description: "Automatically detects languages, libraries, databases, and tools from your project summaries and organizes them into searchable badges.",
            icon: "file-code",
          },
          {
            title: "Zero Hallucination Guardrails",
            description: "The AI only enhances and structures your real experience — never fabricating fake credentials or inaccurate job histories.",
            icon: "shield",
          },
          {
            title: "Instant Live Preview",
            description: "Watch your changes update in real time with our live preview canvas before pushing live to your public link.",
            icon: "zap",
          },
        ]}
        stepsTitle="From Resume to AI Portfolio in 3 Steps"
        stepsSubtitle="Effortless generation with full creative control."
        steps={[
          {
            step: "Step 1",
            title: "Upload Resume or Paste Text",
            description: "Drop your PDF resume into the AI import modal or paste your GitHub links and bullet points.",
          },
          {
            step: "Step 2",
            title: "Review Staged AI Diff",
            description: "Inspect the side-by-side comparison. Accept the AI enhancements you love and keep whatever original text you prefer.",
          },
          {
            step: "Step 3",
            title: "Pick Theme & Publish",
            description: "Choose from 10+ developer aesthetic themes (Terminal, Bento, Minimal) and publish instantly to your public slug.",
          },
        ]}
        comparisonRows={[
          {
            feature: "AI Resume Parsing",
            portfolioOs: "Multimodal Gemini AI",
            others: "Basic regex or None",
          },
          {
            feature: "Granular Diff Version Control",
            portfolioOs: "Block-by-block split diff",
            others: "Overwrites entire site",
          },
          {
            feature: "AI Bullet Enhancer",
            portfolioOs: "Tailored for tech metrics",
            others: "Generic marketing fluff",
          },
          {
            feature: "Cost for AI Generation",
            portfolioOs: "Free",
            others: "$20+ monthly paywall",
          },
        ]}
        faqs={[
          {
            question: "How does the AI portfolio maker work?",
            answer:
              "Portfolio.OS uses Google Gemini AI models to analyze your uploaded resume or typed notes. It identifies your role, work timeline, tech stack, and key accomplishments, converting them into structured, responsive web components that render inside our customizable themes.",
          },
          {
            question: "Does the AI overwrite my existing portfolio content?",
            answer:
              "Never without your explicit approval! When you import or enhance with AI, changes are presented in a split-screen diff viewer. You can accept or reject changes on a block-by-block basis.",
          },
          {
            question: "Can I edit the AI-generated text?",
            answer:
              "Yes, 100%! Every block is completely editable. You can tweak copy, reorder items with drag-and-drop, add new projects, or swap out themes at any time.",
          },
          {
            question: "Is there any cost for using the AI features?",
            answer:
              "No! The AI resume parser, AI text enhancer, and theme generation are completely free to use on Portfolio.OS.",
          },
        ]}
      />
    </>
  );
}
