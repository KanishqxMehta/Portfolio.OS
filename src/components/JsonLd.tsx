// Reusable JSON-LD structured data components for SEO
// These inject schema.org structured data into page <head> for rich search results

export function OrganizationJsonLd({ baseUrl }: { baseUrl: string }) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "Portfolio.OS",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/icon`,
        },
        "description": "Free portfolio builder for developers. Create stunning developer portfolios with beautiful themes and instant publishing.",
        "sameAs": [
          "https://twitter.com/portfolioos",
          "https://github.com/portfolioos"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "name": "Portfolio.OS",
        "url": baseUrl,
        "description": "Build a stunning developer portfolio in minutes — no code needed.",
        "publisher": { "@id": `${baseUrl}/#organization` },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${baseUrl}/#app`,
        "name": "Portfolio.OS — AI Resume to Portfolio Converter",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "description": "AI-powered resume to portfolio converter for developers. Upload a static PDF resume to instantly generate a stunning, responsive developer portfolio website with themes, analytics, and ATS exports.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "featureList": [
          "AI PDF Resume Parser & Ingestion Engine",
          "Resume to Portfolio Converter",
          "Block-based portfolio editor",
          "Multiple premium themes (Brutalist, Terminal, Glassmorphism)",
          "ATS-Friendly PDF Export",
          "Real-time visitor analytics dashboard",
          "Instant publishing with custom subdomains",
          "Mobile responsive design",
        ],
        "provider": { "@id": `${baseUrl}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PersonJsonLd({
  name,
  bio,
  url,
  skills,
  socialLinks,
}: {
  name: string;
  bio?: string;
  url: string;
  skills?: string[];
  socialLinks?: { github?: string; linkedin?: string; twitter?: string; instagram?: string };
}) {
  const sameAs = [
    socialLinks?.github,
    socialLinks?.linkedin,
    socialLinks?.twitter,
    socialLinks?.instagram,
  ].filter(Boolean);

  const data: any = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "url": url,
  };

  if (bio) data.description = bio;
  if (skills && skills.length > 0) data.knowsAbout = skills;
  if (sameAs.length > 0) data.sameAs = sameAs;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SiteNavigationJsonLd({ links }: { links: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": links.map((link, index) => ({
      "@type": "SiteNavigationElement",
      "position": index + 1,
      "name": link.name,
      "url": link.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ crumbs }: { crumbs: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
