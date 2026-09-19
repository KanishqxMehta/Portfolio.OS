import type { Metadata } from "next";
import { ProgrammaticLandingPage } from "@/components/landing/ProgrammaticLandingPage";

export const metadata: Metadata = {
  title: "Resume to Portfolio Converter — Turn PDF into Developer Website | Portfolio.OS",
  description:
    "Convert your PDF resume into an interactive developer portfolio website in seconds. Automatic project extraction, tech stack tagging, and live staging diffs.",
  keywords: [
    "resume to portfolio converter",
    "convert resume to portfolio website",
    "turn resume into portfolio",
    "pdf resume to website",
    "resume to developer website",
    "convert cv to portfolio",
    "import resume to portfolio maker",
  ],
  alternates: {
    canonical: "https://portfolioos.dev/resume-to-portfolio",
  },
  openGraph: {
    title: "Resume to Portfolio Converter | Portfolio.OS",
    description: "Upload your PDF resume to instantly generate a responsive, modern developer portfolio website.",
    url: "https://portfolioos.dev/resume-to-portfolio",
    type: "website",
  },
};

export default function ResumeToPortfolioPage() {
  return (
    <>
      {/* HowTo and SoftwareApplication Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Portfolio.OS — Resume to Portfolio Converter",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Convert PDF resumes into live developer portfolio websites with one click. Automatic extraction of experience, education, projects, and tech stacks.",
            featureList: [
              "Drag-and-drop PDF resume ingestion",
              "AI-powered section extraction",
              "Interactive split-screen diff review",
              "Automatic tech stack categorization",
              "Instant live web portfolio deployment",
            ],
          }),
        }}
      />

      <ProgrammaticLandingPage
        badgeText="1-Click PDF Ingestion Engine"
        badgeIcon="file-up"
        h1Title="Resume to Portfolio"
        h1Highlight="Converter for Developers"
        subheading="Don't spend hours retyping your job history and projects into website builders. Upload your PDF resume, let our AI parser extract your career story, and publish an interactive web portfolio in seconds."
        primaryCtaText="Convert Your Resume Free"
        primaryCtaHref="/dashboard/edit?action=ai-parser"
        secondaryCtaText="See Converted Examples"
        canonicalPath="/resume-to-portfolio"
        featuresTitle="The Easiest Way to Turn Paper into a Live Website"
        featuresSubtitle="Traditional website builders make you retype everything. Portfolio.OS does the heavy lifting for you."
        features={[
          {
            title: "Universal PDF Parsing",
            description: "Works with standard single-column and multi-column PDF resumes created on Google Docs, Word, LaTeX, or Canva.",
            icon: "file-up",
          },
          {
            title: "Automated Block Extraction",
            description: "Intelligently extracts your Bio, Work Experience, Education, Projects, and Skills into modular, reorderable blocks.",
            icon: "layers",
          },
          {
            title: "Staged Visual Diff Review",
            description: "Compare the extracted information side-by-side with your existing portfolio before applying any changes.",
            icon: "git-compare",
          },
          {
            title: "Tech Stack Tagging",
            description: "Identifies programming languages and tools mentioned in your experience and formats them into sleek UI badges.",
            icon: "sparkles",
          },
          {
            title: "Bi-directional ATS Sync",
            description: "After updating your portfolio, re-export a fresh, recruiter-friendly ATS resume PDF anytime.",
            icon: "file-text",
          },
          {
            title: "Instant Web Publishing",
            description: "Publishes directly to a public slug like 'portfolioos.dev/p/yourname' that looks incredible on mobile, tablet, and desktop.",
            icon: "globe",
          },
        ]}
        stepsTitle="Convert Your Resume in 3 Simple Steps"
        stepsSubtitle="From a static PDF document to an interactive web presence."
        steps={[
          {
            step: "Step 1",
            title: "Upload Your PDF Resume",
            description: "Drag and drop your current resume into the converter. Client-side parsing ensures your file is processed securely.",
          },
          {
            step: "Step 2",
            title: "Review Extracted Sections",
            description: "See your resume mapped into Hero, Experience, Projects, and Skills blocks. Accept or fine-tune individual items.",
          },
          {
            step: "Step 3",
            title: "Select Theme & Launch",
            description: "Pick your favorite developer aesthetic theme and share your new live URL on job applications and social profiles.",
          },
        ]}
        comparisonRows={[
          {
            feature: "Resume Ingestion Method",
            portfolioOs: "1-Click PDF Upload",
            others: "Manual copy & paste each block",
          },
          {
            feature: "Setup Time",
            portfolioOs: "Under 60 seconds",
            others: "4 to 8 hours",
          },
          {
            feature: "Diff Staging Review",
            portfolioOs: "Yes, side-by-side preview",
            others: "No, overwrite or retype",
          },
          {
            feature: "Export back to ATS PDF",
            portfolioOs: true,
            others: false,
          },
        ]}
        faqs={[
          {
            question: "What resume formats are supported?",
            answer:
              "Portfolio.OS supports standard PDF resumes (.pdf). Whether your resume was built in Google Docs, Microsoft Word, LaTeX, or Canva, our parser can extract your information accurately.",
          },
          {
            question: "Is my resume data kept private and secure?",
            answer:
              "Yes! Your resume is processed securely solely to populate your developer portfolio blocks. We never sell your personal contact info or share your resume with third-party advertisers.",
          },
          {
            question: "What if the parser misses a project or job?",
            answer:
              "You have full manual control! After parsing, you can add new projects, edit company names, reorder your work timeline, or remove any block with a single click.",
          },
          {
            question: "Can I re-import an updated resume later?",
            answer:
              "Yes! When you gain new experience or finish a project, simply upload your new resume. Our split-screen diff viewer lets you selectively merge only the new additions without losing your existing theme customizations.",
          },
        ]}
      />
    </>
  );
}
